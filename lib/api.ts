import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { execute, rows } from "./db";
import {
  secret,
  hash,
  passwordMatches,
  requireUser,
  requireCompany,
  memberships,
  HttpError,
} from "./auth";
import {
  employees,
  employeeColumns,
  competencies,
  qualifications,
  documents,
  activity,
  audit,
} from "./data";
import type { Employee } from "./domain";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const text = (max: number) => z.string().trim().min(1).max(max);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    "Use a valid date.",
  );
const employeeSchema = z.object({
  name: text(120),
  ssn: text(100),
  jobTitle: text(120),
  department: text(100),
  site: text(120),
  email: z.union([z.email(), z.literal("")]).default(""),
  active: z.boolean().default(true),
});
const qualificationSchema = z
  .object({
    employeeId: z.uuid(),
    competencyId: z.uuid(),
    issuer: text(160),
    validFrom: date,
    expiresOn: date.nullable(),
    verification: z.enum(["PENDING", "VERIFIED"]).default("PENDING"),
  })
  .refine(
    (v) => !v.expiresOn || v.expiresOn >= v.validFrom,
    "Expiry cannot be before the start date.",
  );
async function employee(id: string) {
  const value = (
    await rows<Employee>(
      `SELECT ${employeeColumns} FROM employees WHERE id=?`,
      [id],
    )
  )[0];
  if (!value) throw new HttpError(404, "Employee not found.");
  return value;
}
function assertOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const expected = new URL(process.env.APP_URL || "http://localhost:3100")
    .origin;
  if (origin !== expected)
    throw new HttpError(403, "Request origin is not allowed.");
}
export async function route(req: NextRequest, parts: string[]) {
  try {
    const method = req.method;
    const key = parts.join("/");
    if (!["GET", "HEAD"].includes(method)) assertOrigin(req);
    if (key === "health" && method === "GET") {
      await rows("SELECT 1");
      return json({ status: "ok" });
    }
    if (key === "auth/login" && method === "POST") {
      const input = z
        .object({
          email: z.email().max(190),
          password: z.string().min(1).max(256),
          remember: z.boolean().default(false),
        })
        .parse(await req.json());
      const email = input.email.toLowerCase();
      const fingerprint = hash(email);
      await execute(
        "DELETE FROM login_attempts WHERE email_hash=? AND window_start<DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)",
        [fingerprint],
      );
      await execute(
        "INSERT INTO login_attempts(email_hash,attempts,window_start) VALUES (?,1,UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE attempts=attempts+1",
        [fingerprint],
      );
      const attempt = (
        await rows<{ attempts: number }>(
          "SELECT attempts FROM login_attempts WHERE email_hash=?",
          [fingerprint],
        )
      )[0];
      if (attempt.attempts > 10)
        throw new HttpError(429, "Too many attempts. Try again in 15 minutes.");
      const user = (
        await rows<{ id: string; password_hash: string }>(
          "SELECT id,password_hash FROM users WHERE email=?",
          [email],
        )
      )[0];
      const fallback = "0123456789abcdef0123456789abcdef:" + "00".repeat(64);
      if (
        !passwordMatches(input.password, user?.password_hash ?? fallback) ||
        !user ||
        !(await memberships(user.id)).length
      )
        throw new HttpError(401, "Email or password is incorrect.");
      await execute("DELETE FROM login_attempts WHERE email_hash=?", [
        fingerprint,
      ]);
      const token = secret();
      const maxAge = input.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
      await execute(
        "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? SECOND))",
        [hash(token), user.id, maxAge],
      );
      const response = json({ ok: true });
      response.cookies.set("skills_session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.COOKIE_SECURE === "true",
        path: "/",
        maxAge,
      });
      return response;
    }
    if (key === "auth/logout" && method === "POST") {
      const token = req.cookies.get("skills_session")?.value;
      if (token)
        await execute("DELETE FROM sessions WHERE token_hash=?", [hash(token)]);
      const response = json({ ok: true });
      response.cookies.set("skills_session", "", { path: "/", maxAge: 0 });
      return response;
    }
    if (parts[0] === "public" && method === "GET") {
      const e = (
        await rows<Employee>(
          `SELECT ${employeeColumns} FROM employees WHERE qr_token=? AND active=TRUE`,
          [parts[1] ?? ""],
        )
      )[0];
      if (!e)
        throw new HttpError(
          404,
          "This passport is unavailable or has been replaced.",
        );
      if (parts[2] === "documents" && parts[3])
        return await serveDocument(parts[3], e.companyId, e.id);
      const company = (
        await rows<{ name: string }>("SELECT name FROM companies WHERE id=?", [
          e.companyId,
        ])
      )[0];
      const quals = (await qualifications(e.companyId)).filter(
        (q) => q.employeeId === e.id,
      );
      const docs = (await documents(e.companyId)).filter(
        (d) => d.employeeId === e.id,
      );
      return json({
        employee: {
          name: e.name,
          jobTitle: e.jobTitle,
          company: company.name,
          photoId: e.photoId,
        },
        qualifications: quals,
        documents: docs,
        checkedAt: new Date().toISOString(),
      });
    }
    if (parts[0] === "reports" && method === "GET")
      return await report(req, parts[1]);
    if (key === "workspace" && method === "GET") {
      const user = await requireUser();
      const companies = await memberships(user.id);
      const id = req.nextUrl.searchParams.get("company") || companies[0]?.id;
      const company = companies.find((c) => c.id === id);
      if (!company) throw new HttpError(403, "No access to this company.");
      const [es, cs, qs, ds, as, ts] = await Promise.all([
        employees(company.id),
        competencies(company.id),
        qualifications(company.id),
        documents(company.id),
        activity(company.id),
        rows(
          "SELECT id,name,created_at AS createdAt,expires_at AS expiresAt FROM api_tokens WHERE company_id=? AND user_id=? ORDER BY created_at DESC",
          [company.id, user.id],
        ),
      ]);
      return json({
        user,
        companies,
        company,
        employees: es,
        competencies: cs,
        qualifications: qs,
        documents: ds,
        activity: as,
        tokens: ts,
      });
    }
    if (key === "employees" && method === "POST") {
      const body = await req.json();
      const companyId = z.uuid().parse(body.companyId);
      const { user } = await requireCompany(companyId, true);
      const value = employeeSchema.parse(body);
      const id = randomUUID();
      await execute(
        "INSERT INTO employees(id,company_id,name,ssn,job_title,department,site,email,active,qr_token) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [
          id,
          companyId,
          value.name,
          value.ssn,
          value.jobTitle,
          value.department,
          value.site,
          value.email,
          value.active,
          secret(),
        ],
      );
      await audit(companyId, user.id, "Employee added", value.name);
      return json({ id }, 201);
    }
    if (parts[0] === "employees" && parts[1] && method === "PATCH") {
      const e = await employee(parts[1]);
      const { user } = await requireCompany(e.companyId, true);
      const value = employeeSchema.parse(await req.json());
      await execute(
        "UPDATE employees SET name=?,ssn=?,job_title=?,department=?,site=?,email=?,active=? WHERE id=? AND company_id=?",
        [
          value.name,
          value.ssn,
          value.jobTitle,
          value.department,
          value.site,
          value.email,
          value.active,
          e.id,
          e.companyId,
        ],
      );
      await audit(e.companyId, user.id, "Employee updated", value.name);
      return json({ ok: true });
    }
    if (
      parts[0] === "employees" &&
      parts[2] === "rotate-qr" &&
      method === "POST"
    ) {
      const e = await employee(parts[1]);
      const { user } = await requireCompany(e.companyId, true);
      await execute("UPDATE employees SET qr_token=? WHERE id=?", [
        secret(),
        e.id,
      ]);
      await audit(e.companyId, user.id, "QR code replaced", e.name);
      return json({ ok: true });
    }
    if (key === "competencies" && method === "POST") {
      const body = z
        .object({
          companyId: z.uuid(),
          name: text(120),
          category: text(80),
          description: z.string().trim().max(2000).default(""),
        })
        .parse(await req.json());
      const { user } = await requireCompany(body.companyId, true);
      const id = randomUUID();
      await execute(
        "INSERT INTO competencies(id,company_id,name,category,description) VALUES (?,?,?,?,?)",
        [id, body.companyId, body.name, body.category, body.description],
      );
      await audit(body.companyId, user.id, "Competency created", body.name);
      return json({ id }, 201);
    }
    if (key === "qualifications" && method === "POST") {
      const body = qualificationSchema.parse(await req.json());
      const e = await employee(body.employeeId);
      const { user } = await requireCompany(e.companyId, true);
      const c = (await competencies(e.companyId)).find(
        (c) => c.id === body.competencyId,
      );
      if (!c)
        throw new HttpError(400, "Choose a competency from this company.");
      const id = randomUUID();
      await execute(
        "INSERT INTO qualifications(id,company_id,employee_id,competency_id,issuer,valid_from,expires_on,verification) VALUES (?,?,?,?,?,?,?,?)",
        [
          id,
          e.companyId,
          e.id,
          c.id,
          body.issuer,
          body.validFrom,
          body.expiresOn,
          body.verification,
        ],
      );
      await audit(
        e.companyId,
        user.id,
        "Qualification recorded",
        e.name + " · " + c.name,
      );
      return json({ id }, 201);
    }
    if (parts[0] === "qualifications" && parts[1] && method === "PATCH") {
      const q = (
        await rows<{ companyId: string; employeeId: string; name: string }>(
          "SELECT q.company_id AS companyId,q.employee_id AS employeeId,c.name FROM qualifications q JOIN competencies c ON c.id=q.competency_id WHERE q.id=?",
          [parts[1]],
        )
      )[0];
      if (!q) throw new HttpError(404, "Qualification not found.");
      const { user } = await requireCompany(q.companyId, true);
      const owner = await employee(q.employeeId);
      const body = z
        .object({
          verification: z.enum(["PENDING", "VERIFIED"]).optional(),
          revoked: z.boolean().optional(),
        })
        .refine((v) => v.verification !== undefined || v.revoked !== undefined)
        .parse(await req.json());
      if (body.verification !== undefined)
        await execute("UPDATE qualifications SET verification=? WHERE id=?", [
          body.verification,
          parts[1],
        ]);
      if (body.revoked !== undefined)
        await execute("UPDATE qualifications SET revoked=? WHERE id=?", [
          body.revoked,
          parts[1],
        ]);
      await audit(
        q.companyId,
        user.id,
        body.revoked
          ? "Qualification revoked"
          : body.verification === "VERIFIED"
            ? "Qualification verified"
            : "Qualification updated",
        owner.name + " · " + q.name,
      );
      return json({ ok: true });
    }
    if (key === "uploads" && method === "POST") return await upload(req);
    if (parts[0] === "documents" && parts[1] && method === "GET") {
      const d = (
        await rows<{ companyId: string }>(
          "SELECT company_id AS companyId FROM documents WHERE id=?",
          [parts[1]],
        )
      )[0];
      if (!d) throw new HttpError(404, "Document not found.");
      await requireCompany(d.companyId);
      return await serveDocument(parts[1], d.companyId);
    }
    if (key === "tokens" && method === "POST") {
      const body = z
        .object({ companyId: z.uuid(), name: text(100) })
        .parse(await req.json());
      const { user } = await requireCompany(body.companyId);
      const token = "sk_" + secret();
      const id = randomUUID();
      await execute(
        "INSERT INTO api_tokens(id,user_id,company_id,name,token_hash,expires_at) VALUES (?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 90 DAY))",
        [id, user.id, body.companyId, body.name, hash(token)],
      );
      await audit(body.companyId, user.id, "Reporting key created", body.name);
      return json({ id, token }, 201);
    }
    if (parts[0] === "tokens" && parts[1] && method === "DELETE") {
      const user = await requireUser();
      const result = await execute(
        "DELETE FROM api_tokens WHERE id=? AND user_id=?",
        [parts[1], user.id],
      );
      if (!result.affectedRows) throw new HttpError(404, "Key not found.");
      return json({ ok: true });
    }
    throw new HttpError(404, "Endpoint not found.");
  } catch (error) {
    if (error instanceof HttpError) {
      const response = json({ error: error.message }, error.status);
      if (error.status === 401 && parts[0] === "reports")
        response.headers.set(
          "WWW-Authenticate",
          'Basic realm="Skills reporting", charset="UTF-8"',
        );
      return response;
    }
    if (error instanceof z.ZodError)
      return json(
        {
          error: error.issues
            .map(
              (i) =>
                (i.path.join(".") ? i.path.join(".") + ": " : "") + i.message,
            )
            .join(" "),
        },
        400,
      );
    if ((error as { code?: string }).code === "ER_DUP_ENTRY")
      return json(
        { error: "This identifier or name already exists in the company." },
        409,
      );
    if (error instanceof SyntaxError)
      return json({ error: "Invalid request body." }, 400);
    console.error(
      "API operation failed:",
      (error as { code?: string }).code ?? (error as Error).name,
    );
    return json(
      { error: "The operation could not be completed. Please try again." },
      500,
    );
  }
}
async function serveDocument(
  id: string,
  companyId: string,
  employeeId?: string,
) {
  const d = (
    await rows<{
      storageName: string;
      mimeType: string;
      originalName: string;
      employeeId: string;
    }>(
      "SELECT storage_name AS storageName,mime_type AS mimeType,original_name AS originalName,employee_id AS employeeId FROM documents WHERE id=? AND company_id=?",
      [id, companyId],
    )
  )[0];
  if (!d || (employeeId && d.employeeId !== employeeId))
    throw new HttpError(404, "Document not found.");
  const buffer = await readFile(
    /* turbopackIgnore: true */ path.join(
      /* turbopackIgnore: true */ process.env.UPLOAD_DIR || "uploads",
      path.basename(d.storageName),
    ),
  );
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": d.mimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(d.originalName)}`,
      "Cache-Control": "no-store",
      "Content-Security-Policy": "sandbox; default-src 'none'",
    },
  });
}
async function upload(req: NextRequest) {
  await requireUser();
  if (Number(req.headers.get("content-length") || 0) > 11 * 1024 * 1024)
    throw new HttpError(413, "Files must be 10 MB or smaller.");
  // Bound streamed/chunked bodies too; Content-Length alone is not reliable.
  if (!req.body) throw new HttpError(400, "Choose a file to upload.");
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 11 * 1024 * 1024) {
      await reader.cancel();
      throw new HttpError(413, "Files must be 10 MB or smaller.");
    }
    chunks.push(part.value);
  }
  let data: FormData;
  try {
    data = await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": req.headers.get("content-type") || "" },
    }).formData();
  } catch {
    throw new HttpError(400, "Use a multipart file upload.");
  }
  const e = await employee(z.uuid().parse(data.get("employeeId")));
  const { user } = await requireCompany(e.companyId, true);
  const kind = z.enum(["PHOTO", "DIPLOMA"]).parse(data.get("kind"));
  const file = data.get("file");
  if (
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > 10 * 1024 * 1024
  )
    throw new HttpError(400, "Choose a file up to 10 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const isPdf = bytes.subarray(0, 5).toString() === "%PDF-";
  const isPng = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const mime = isPdf
    ? "application/pdf"
    : isPng
      ? "image/png"
      : isJpg
        ? "image/jpeg"
        : null;
  if (!mime || (kind === "PHOTO" && isPdf))
    throw new HttpError(
      400,
      "Use a PNG or JPEG photo, or a PDF, PNG, or JPEG diploma.",
    );
  const qualificationId =
    kind === "DIPLOMA" ? z.uuid().parse(data.get("qualificationId")) : null;
  if (
    qualificationId &&
    !(
      await rows(
        "SELECT id FROM qualifications WHERE id=? AND employee_id=? AND company_id=?",
        [qualificationId, e.id, e.companyId],
      )
    ).length
  )
    throw new HttpError(400, "Qualification does not belong to this employee.");
  const id = randomUUID();
  const storageName = id + (isPdf ? ".pdf" : isPng ? ".png" : ".jpg");
  const dir = process.env.UPLOAD_DIR || "uploads";
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(/* turbopackIgnore: true */ dir, storageName),
    bytes,
    { flag: "wx" },
  );
  try {
    await execute(
      "INSERT INTO documents(id,company_id,employee_id,qualification_id,kind,original_name,storage_name,mime_type,size_bytes) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        id,
        e.companyId,
        e.id,
        qualificationId,
        kind,
        path.basename(file.name).slice(0, 200),
        storageName,
        mime,
        bytes.length,
      ],
    );
  } catch (error) {
    await unlink(path.join(/* turbopackIgnore: true */ dir, storageName));
    throw error;
  }
  if (kind === "PHOTO")
    await execute("UPDATE employees SET photo_id=? WHERE id=?", [id, e.id]);
  await audit(
    e.companyId,
    user.id,
    kind === "PHOTO" ? "Photo uploaded" : "Diploma uploaded",
    e.name,
  );
  return json({ id }, 201);
}
async function report(req: NextRequest, dataset: string) {
  let token = "";
  const authorization = req.headers.get("authorization") || "";
  if (authorization.startsWith("Bearer ")) token = authorization.slice(7);
  if (authorization.startsWith("Basic ")) {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString();
    const split = decoded.indexOf(":");
    if (decoded.slice(0, split) === "token") token = decoded.slice(split + 1);
  }
  if (!token)
    throw new HttpError(
      401,
      "Use a reporting key with Bearer authentication or Basic username token and the key as password.",
    );
  const key = (
    await rows<{ companyId: string }>(
      "SELECT t.company_id AS companyId FROM api_tokens t JOIN memberships m ON m.user_id=t.user_id AND m.company_id=t.company_id WHERE t.token_hash=? AND t.expires_at>UTC_TIMESTAMP()",
      [hash(token)],
    )
  )[0];
  if (!key) throw new HttpError(401, "Reporting key is invalid or expired.");
  const es = await employees(key.companyId);
  let data: unknown[];
  if (dataset === "employees") data = es.map(({ qrToken, photoId, ...e }) => e);
  else if (dataset === "competencies") data = await competencies(key.companyId);
  else if (dataset === "qualifications") {
    const map = new Map(es.map((e) => [e.id, e]));
    data = (await qualifications(key.companyId)).map((q) => ({
      ...q,
      employeeName: map.get(q.employeeId)?.name,
      ssn: map.get(q.employeeId)?.ssn,
      department: map.get(q.employeeId)?.department,
      site: map.get(q.employeeId)?.site,
    }));
  } else
    throw new HttpError(
      404,
      "Choose employees, competencies, or qualifications.",
    );
  const page = z.coerce
    .number()
    .int()
    .min(1)
    .max(100000)
    .parse(req.nextUrl.searchParams.get("page") || 1);
  const pageSize = z.coerce
    .number()
    .int()
    .min(1)
    .max(1000)
    .parse(req.nextUrl.searchParams.get("pageSize") || 1000);
  return json({
    data: data.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total: data.length,
    hasMore: page * pageSize < data.length,
  });
}

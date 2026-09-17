import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { rows, execute, pool } from "../lib/db";
import { passwordHash } from "../lib/auth";
const restrictedUserId = randomUUID();
const base = process.env.APP_URL || "http://localhost:3100";
let checks = 0;
function check(condition: unknown, message: string) {
  assert.ok(condition, message);
  checks++;
  console.log("PASS " + message);
}
async function request(
  url: string,
  {
    method = "GET",
    body,
    cookie = "",
    auth = "",
  }: { method?: string; body?: unknown; cookie?: string; auth?: string } = {},
) {
  const response = await fetch(base + "/api/" + url, {
    method,
    headers: {
      Origin: base,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(auth ? { Authorization: auth } : {}),
      ...(body && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  let result: any;
  const type = response.headers.get("content-type") || "";
  if (type.includes("json")) result = await response.json();
  else result = await response.arrayBuffer();
  return { response, result };
}
async function login(email: string) {
  const { response } = await request("auth/login", {
    method: "POST",
    body: { email, password: process.env.SEED_PASSWORD },
  });
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie")!.split(";")[0];
}
const createdEmployees: string[] = [];
const createdSkills: string[] = [];
const createdTokens: string[] = [];
const suffix = randomUUID().slice(0, 8);
try {
  check(
    (await request("workspace")).response.status === 401,
    "Anonymous workspace access denied",
  );
  const hr = await login(process.env.SEED_HR_EMAIL || "hr@example.test");
  const workspace = (await request("workspace", { cookie: hr })).result;
  const company = workspace.company.id;
  const other = workspace.companies.find((c: any) => c.id !== company).id;
  await execute(
    "INSERT INTO users(id,name,email,password_hash) VALUES (?,?,?,?)",
    [
      restrictedUserId,
      "Test HR",
      "hr-" + suffix + "@example.test",
      passwordHash(process.env.SEED_PASSWORD!),
    ],
  );
  await execute(
    "INSERT INTO memberships(user_id,company_id,role) VALUES (?,?,'HR')",
    [restrictedUserId, other],
  );
  const restricted = await login("hr-" + suffix + "@example.test");
  check(
    workspace.companies.every((c: any) => c.role === "HR"),
    "Only HR role is exposed",
  );
  const obsolete = await request("auth/login", {
    method: "POST",
    body: {
      email: "manager@example.test",
      password: process.env.SEED_PASSWORD,
    },
  });
  check(
    obsolete.response.status === 401,
    "Removed manager account cannot sign in",
  );
  check(
    (await request("workspace?company=" + company, { cookie: restricted }))
      .response.status === 403,
    "HR cannot read an unassigned company",
  );
  const input = {
    companyId: company,
    name: "Integration Worker " + suffix,
    ssn: "TEST-" + suffix,
    jobTitle: "Test technician",
    department: "QA",
    site: "Test site",
    email: "",
    active: true,
  };
  check(
    (
      await request("employees", {
        method: "POST",
        body: input,
        cookie: restricted,
      })
    ).response.status === 403,
    "HR cannot add employees to an unassigned company",
  );
  const created = await request("employees", {
    method: "POST",
    body: input,
    cookie: hr,
  });
  assert.equal(created.response.status, 201, JSON.stringify(created.result));
  createdEmployees.push(created.result.id);
  const employeeId = created.result.id;
  check(
    (await request("employees", { method: "POST", body: input, cookie: hr }))
      .response.status === 409,
    "Duplicate employee identifiers rejected",
  );
  const c = await request("competencies", {
    method: "POST",
    cookie: hr,
    body: {
      companyId: company,
      name: "Integration competency " + suffix,
      category: "QA",
      description: "Synthetic test",
    },
  });
  assert.equal(c.response.status, 201);
  createdSkills.push(c.result.id);
  const qBody = {
    employeeId,
    competencyId: c.result.id,
    issuer: "Test provider",
    validFrom: "2026-01-01",
    expiresOn: null,
    verification: "PENDING",
  };
  check(
    (
      await request("qualifications", {
        method: "POST",
        cookie: hr,
        body: { ...qBody, validFrom: "2026-02-30" },
      })
    ).response.status === 400,
    "Impossible validity date rejected",
  );
  const foreign = (await request("workspace?company=" + other, { cookie: hr }))
    .result;
  check(
    (
      await request("qualifications", {
        method: "POST",
        cookie: hr,
        body: { ...qBody, competencyId: foreign.competencies[0].id },
      })
    ).response.status === 400,
    "Cross-company qualification association rejected",
  );
  const qualification = await request("qualifications", {
    method: "POST",
    cookie: hr,
    body: qBody,
  });
  assert.equal(qualification.response.status, 201);
  const qualificationId = qualification.result.id;
  let w = (await request("workspace?company=" + company, { cookie: hr }))
    .result;
  let e = w.employees.find((x: any) => x.id === employeeId);
  const oldToken = e.qrToken;
  let publicProfile = await request("public/" + oldToken);
  check(
    publicProfile.response.status === 200,
    "Public QR profile opens without an account",
  );
  check(
    !("ssn" in publicProfile.result.employee) &&
      !("email" in publicProfile.result.employee),
    "Public profile excludes SSN and internal email",
  );
  check(
    publicProfile.result.qualifications[0].verification === "PENDING",
    "Valid dates do not automatically verify a qualification",
  );
  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF",
  );
  const form = () => {
    const f = new FormData();
    f.set("employeeId", employeeId);
    f.set("qualificationId", qualificationId);
    f.set("kind", "DIPLOMA");
    f.set(
      "file",
      new Blob([pdf], { type: "application/pdf" }),
      "integration.pdf",
    );
    return f;
  };
  check(
    (
      await request("uploads", {
        method: "POST",
        cookie: restricted,
        body: form(),
      })
    ).response.status === 403,
    "Uploads to an unassigned company denied",
  );
  const invalid = form();
  invalid.set(
    "file",
    new Blob(["<script>alert(1)</script>"], { type: "application/pdf" }),
    "fake.pdf",
  );
  check(
    (await request("uploads", { method: "POST", cookie: hr, body: invalid }))
      .response.status === 400,
    "Mislabeled executable content rejected",
  );
  const upload = await request("uploads", {
    method: "POST",
    cookie: hr,
    body: form(),
  });
  check(upload.response.status === 201, "HR can upload diploma evidence");
  const documentId = upload.result.id;
  check(
    (await request(`public/${oldToken}/documents/${documentId}`)).response
      .status === 200,
    "Diploma is publicly readable through its passport",
  );
  check(
    (await request(`documents/${documentId}`)).response.status === 401,
    "Internal document route requires authentication",
  );
  const stranger = workspace.employees[0];
  check(
    (await request(`public/${stranger.qrToken}/documents/${documentId}`))
      .response.status === 404,
    "A passport cannot access another employee document",
  );
  const photo = new FormData();
  photo.set("employeeId", employeeId);
  photo.set("kind", "PHOTO");
  photo.set(
    "file",
    new Blob(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
          "base64",
        ),
      ],
      { type: "image/png" },
    ),
    "test-photo.png",
  );
  check(
    (await request("uploads", { method: "POST", cookie: hr, body: photo }))
      .response.status === 201,
    "HR can upload employee photograph",
  );
  const verify = await request("qualifications/" + qualificationId, {
    method: "PATCH",
    cookie: hr,
    body: { verification: "VERIFIED" },
  });
  check(verify.response.status === 200, "HR can verify the qualification");
  const token = await request("tokens", {
    method: "POST",
    cookie: hr,
    body: { companyId: company, name: "Integration " + suffix },
  });
  assert.equal(token.response.status, 201);
  createdTokens.push(token.result.id);
  const apiKey = token.result.token;
  const report = await request("reports/employees?pageSize=1", {
    auth: "Basic " + Buffer.from("token:" + apiKey).toString("base64"),
  });
  check(
    report.response.status === 200 &&
      report.result.data.length === 1 &&
      report.result.hasMore,
    "Excel Basic authentication and pagination work",
  );
  const all = await request("reports/employees", { auth: "Bearer " + apiKey });
  check(
    all.result.data.every((r: any) => r.companyId === company) &&
      all.result.data.some((r: any) => r.id === employeeId),
    "Reporting key returns only its company data",
  );
  check(
    (
      await request("employees", {
        method: "POST",
        auth: "Bearer " + apiKey,
        body: input,
      })
    ).response.status === 401,
    "Read-only reporting key cannot write",
  );
  await request("tokens/" + token.result.id, {
    method: "DELETE",
    cookie: hr,
  });
  check(
    (await request("reports/employees", { auth: "Bearer " + apiKey })).response
      .status === 401,
    "Revoked reporting key stops working",
  );
  const label = await fetch(base + "/label/" + employeeId, {
    headers: { Cookie: hr },
  });
  check(
    label.status === 200 &&
      (await label.text()).includes("data:image/png;base64"),
    "Printable label contains a generated QR image",
  );
  await request("employees/" + employeeId + "/rotate-qr", {
    method: "POST",
    cookie: hr,
    body: {},
  });
  check(
    (await request("public/" + oldToken)).response.status === 404,
    "Old QR stops working after replacement",
  );
  w = (await request("workspace?company=" + company, { cookie: hr })).result;
  e = w.employees.find((x: any) => x.id === employeeId);
  check(
    (await request("public/" + e.qrToken)).response.status === 200,
    "Replacement QR opens the current passport",
  );
  await request("employees/" + employeeId, {
    method: "PATCH",
    cookie: hr,
    body: { ...input, active: false },
  });
  check(
    (await request("public/" + e.qrToken)).response.status === 404,
    "Deactivated employee passport is unavailable",
  );
  check(
    (await request(`public/${e.qrToken}/documents/${documentId}`)).response
      .status === 404,
    "Deactivation disables public document access",
  );
  const cross = await fetch(base + "/api/tokens", {
    method: "POST",
    headers: {
      Cookie: hr,
      Origin: "https://untrusted.example",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ companyId: company, name: "forged" }),
  });
  check(cross.status === 403, "Cross-origin write is blocked");
  await request("auth/logout", { method: "POST", cookie: restricted });
  check(
    (await request("workspace", { cookie: restricted })).response.status ===
      401,
    "Logout invalidates the server-side session",
  );
  await request("auth/logout", { method: "POST", cookie: hr });
  console.log(`Completed ${checks} integration checks.`);
} finally {
  for (const id of createdTokens)
    await execute("DELETE FROM api_tokens WHERE id=?", [id]);
  for (const id of createdEmployees) {
    const files = await rows<{ storage_name: string }>(
      "SELECT storage_name FROM documents WHERE employee_id=?",
      [id],
    );
    await execute("DELETE FROM documents WHERE employee_id=?", [id]);
    for (const file of files)
      await unlink(
        path.join(process.env.UPLOAD_DIR || "uploads", file.storage_name),
      ).catch(() => {});
    await execute("DELETE FROM qualifications WHERE employee_id=?", [id]);
    await execute("DELETE FROM employees WHERE id=?", [id]);
  }
  for (const id of createdSkills)
    await execute("DELETE FROM competencies WHERE id=?", [id]);
  await execute("DELETE FROM audit_events WHERE subject LIKE ?", [
    "%" + suffix + "%",
  ]);
  await execute("DELETE FROM sessions WHERE user_id=?", [restrictedUserId]);
  await execute("DELETE FROM memberships WHERE user_id=?", [restrictedUserId]);
  await execute("DELETE FROM users WHERE id=?", [restrictedUserId]);
  await pool().end();
}

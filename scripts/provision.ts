import { parseArgs } from "node:util";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { pool } from "../lib/db";
import { passwordHash } from "../lib/auth";
import type { RowDataPacket } from "mysql2/promise";
const { values } = parseArgs({
  options: {
    company: { type: "string" },
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
    "existing-user": { type: "boolean", default: false },
  },
});
const input = z
  .object({
    company: z.string().trim().min(1).max(120),
    email: z.email().max(190),
    name: z.string().trim().min(1).max(120),
    role: z.literal("HR").default("HR"),
  })
  .parse(values);
const connection = await pool().getConnection();
try {
  await connection.beginTransaction();
  const [companies] = await connection.execute<RowDataPacket[]>(
    "SELECT id FROM companies WHERE name=?",
    [input.company],
  );
  if (companies.length > 1)
    throw new Error("Company name is ambiguous; use a distinct company name.");
  const companyId = companies[0]?.id ?? randomUUID();
  if (!companies.length)
    await connection.execute("INSERT INTO companies(id,name) VALUES (?,?)", [
      companyId,
      input.company,
    ]);
  const [users] = await connection.execute<RowDataPacket[]>(
    "SELECT id FROM users WHERE email=?",
    [input.email.toLowerCase()],
  );
  let userId = users[0]?.id;
  if (userId && !values["existing-user"])
    throw new Error(
      "User already exists. Use --existing-user explicitly to grant membership in this company.",
    );
  if (!userId) {
    if (values["existing-user"])
      throw new Error("Existing user was not found.");
    const password = z
      .string()
      .min(16)
      .max(256)
      .parse(process.env.ACCOUNT_PASSWORD);
    userId = randomUUID();
    await connection.execute(
      "INSERT INTO users(id,name,email,password_hash) VALUES (?,?,?,?)",
      [userId, input.name, input.email.toLowerCase(), passwordHash(password)],
    );
  }
  await connection.execute(
    "INSERT INTO memberships(user_id,company_id,role) VALUES (?,?,?)",
    [userId, companyId, input.role],
  );
  await connection.commit();
  console.log(
    `Provisioned ${input.role} membership for ${input.email} in ${input.company}.`,
  );
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await pool().end();
}

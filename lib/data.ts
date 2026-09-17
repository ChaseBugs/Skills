import { rows, execute } from "./db";
import { randomUUID } from "node:crypto";
import {
  validity,
  type Employee,
  type Qualification,
  type Competency,
  type DocumentRecord,
  type Audit,
} from "./domain";
export const employeeColumns =
  "id,company_id AS companyId,name,ssn,job_title AS jobTitle,department,site,email,active,qr_token AS qrToken,photo_id AS photoId,created_at AS createdAt";
export async function employees(companyId: string) {
  return rows<Employee>(
    `SELECT ${employeeColumns} FROM employees WHERE company_id=? ORDER BY name`,
    [companyId],
  );
}
export async function competencies(companyId: string) {
  return rows<Competency>(
    "SELECT id,company_id AS companyId,name,category,description FROM competencies WHERE company_id=? ORDER BY name",
    [companyId],
  );
}
export async function qualifications(companyId: string) {
  const result = await rows<Qualification>(
    `SELECT q.id,q.employee_id AS employeeId,q.competency_id AS competencyId,c.name,c.category,q.issuer,q.valid_from AS validFrom,q.expires_on AS expiresOn,q.verification,q.revoked,(SELECT COUNT(*) FROM documents d WHERE d.qualification_id=q.id) AS documentCount FROM qualifications q JOIN competencies c ON c.id=q.competency_id WHERE q.company_id=? ORDER BY q.created_at DESC`,
    [companyId],
  );
  return result.map((q) => ({ ...q, status: validity(q) }));
}
export async function documents(companyId: string) {
  return rows<DocumentRecord>(
    "SELECT id,qualification_id AS qualificationId,employee_id AS employeeId,original_name AS originalName,mime_type AS mimeType,size_bytes AS sizeBytes,kind,created_at AS createdAt FROM documents WHERE company_id=? ORDER BY created_at DESC",
    [companyId],
  );
}
export async function activity(companyId: string) {
  return rows<Audit>(
    "SELECT a.id,a.action,a.subject,u.name AS actor,a.created_at AS createdAt FROM audit_events a JOIN users u ON u.id=a.user_id WHERE a.company_id=? ORDER BY a.created_at DESC LIMIT 20",
    [companyId],
  );
}
export async function audit(
  companyId: string,
  userId: string,
  action: string,
  subject: string,
) {
  await execute(
    "INSERT INTO audit_events (id,company_id,user_id,action,subject) VALUES (?,?,?,?,?)",
    [randomUUID(), companyId, userId, action, subject],
  );
}

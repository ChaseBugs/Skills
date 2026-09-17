import {
  randomBytes,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { rows } from "./db";
import type { Company } from "./domain";
export const secret = () => randomBytes(32).toString("hex");
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function passwordHash(value: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(value, salt, 64).toString("hex");
}
export function passwordMatches(value: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const computed = scryptSync(value, salt, 64);
  const expected = Buffer.from(key, "hex");
  return (
    expected.length === computed.length && timingSafeEqual(expected, computed)
  );
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export type User = { id: string; name: string; email: string };
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get("skills_session")?.value;
  if (!token) return null;
  return (
    (
      await rows<User>(
        "SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP() AND EXISTS (SELECT 1 FROM memberships m WHERE m.user_id=u.id AND m.role='HR')",
        [hash(token)],
      )
    )[0] ?? null
  );
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Please sign in to continue.");
  return user;
}
export async function memberships(userId: string) {
  return rows<Company>(
    "SELECT c.id,c.name,m.role FROM memberships m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? ORDER BY c.name",
    [userId],
  );
}
export async function requireCompany(companyId: string, hr = false) {
  const user = await requireUser();
  const company = (await memberships(user.id)).find((c) => c.id === companyId);
  if (!company)
    throw new HttpError(403, "This company is not available to your account.");
  if (hr && company.role !== "HR")
    throw new HttpError(403, "Only HR can make this change.");
  return { user, company };
}

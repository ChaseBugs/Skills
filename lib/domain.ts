export type Validity =
  "Valid" | "Expiring soon" | "Expired" | "Upcoming" | "Revoked";
export function validity(
  q: {
    validFrom: string;
    expiresOn: string | null;
    revoked?: number | boolean;
  },
  today = new Date().toISOString().slice(0, 10),
): Validity {
  if (q.revoked) return "Revoked";
  if (q.validFrom > today) return "Upcoming";
  if (!q.expiresOn) return "Valid";
  if (q.expiresOn < today) return "Expired";
  const days = Math.round(
    (Date.parse(q.expiresOn + "T00:00:00Z") -
      Date.parse(today + "T00:00:00Z")) /
      86400000,
  );
  return days <= 30 ? "Expiring soon" : "Valid";
}
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}
export function dateLabel(date: string | null) {
  return date
    ? new Date(date.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "No expiry";
}
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export type Company = { id: string; name: string; role: "HR" };
export type Employee = {
  id: string;
  companyId: string;
  name: string;
  ssn: string;
  jobTitle: string;
  department: string;
  site: string;
  email: string;
  active: number;
  qrToken: string;
  photoId: string | null;
  createdAt: string;
};
export type Competency = {
  id: string;
  companyId: string;
  name: string;
  category: string;
  description: string;
};
export type Qualification = {
  id: string;
  employeeId: string;
  competencyId: string;
  name: string;
  category: string;
  issuer: string;
  validFrom: string;
  expiresOn: string | null;
  verification: "PENDING" | "VERIFIED";
  revoked: number;
  status: Validity;
  documentCount: number;
};
export type DocumentRecord = {
  id: string;
  qualificationId: string | null;
  employeeId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  kind: "PHOTO" | "DIPLOMA";
  createdAt: string;
};
export type Audit = {
  id: string;
  action: string;
  subject: string;
  actor: string;
  createdAt: string;
};
export type Workspace = {
  user: { id: string; name: string; email: string };
  companies: Company[];
  company: Company;
  employees: Employee[];
  competencies: Competency[];
  qualifications: Qualification[];
  documents: DocumentRecord[];
  activity: Audit[];
  tokens: { id: string; name: string; createdAt: string; expiresAt: string }[];
};

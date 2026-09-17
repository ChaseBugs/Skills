import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  Award,
  Files,
  ExternalLink,
} from "lucide-react";
import { rows } from "@/lib/db";
import { employeeColumns, qualifications, documents } from "@/lib/data";
import { dateLabel, type Employee } from "@/lib/domain";
import { Avatar, Badge, Empty } from "@/components/ui";
export const dynamic = "force-dynamic";
export default async function Passport({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const e = (
    await rows<Employee>(
      `SELECT ${employeeColumns} FROM employees WHERE qr_token=? AND active=TRUE`,
      [token],
    )
  )[0];
  if (!e) notFound();
  const company = (
    await rows<{ name: string }>("SELECT name FROM companies WHERE id=?", [
      e.companyId,
    ])
  )[0];
  const qs = (await qualifications(e.companyId)).filter(
    (q) => q.employeeId === e.id,
  );
  const ds = (await documents(e.companyId)).filter(
    (d) => d.employeeId === e.id,
  );
  return (
    <main className="public-page">
      <div className="public-shell">
        <header className="public-top">
          <div className="brand">
            <span className="brand-icon">
              <ShieldCheck size={26} />
            </span>
            <strong>
              skills<span className="brand-dot">.</span>
            </strong>
          </div>
          <span>DIGITAL SKILLS PASSPORT</span>
        </header>
        <section className="card public-identity">
          <Avatar name={e.name} photoId={e.photoId} publicToken={token} large />
          <h1>{e.name}</h1>
          <p>{e.jobTitle}</p>
          <div className="public-company">
            <Building2 size={14} />
            {company.name}
          </div>
          <Badge>Active</Badge>
          <div className="public-stats">
            <div>
              <strong>
                {
                  qs.filter(
                    (q) =>
                      ["Valid", "Expiring soon"].includes(q.status) &&
                      q.verification === "VERIFIED",
                  ).length
                }
              </strong>
              <span>Verified & valid</span>
            </div>
            <div>
              <strong>
                {qs.filter((q) => q.status === "Expiring soon").length}
              </strong>
              <span>Expiring soon</span>
            </div>
            <div>
              <strong>{ds.filter((d) => d.kind === "DIPLOMA").length}</strong>
              <span>Supporting documents</span>
            </div>
          </div>
        </section>
        <div className="public-section-title">
          <h2>Competencies & qualifications</h2>
          <span>{qs.length} records</span>
        </div>
        {qs.map((q) => (
          <article className="card public-qualification" key={q.id}>
            <div className="qualification-item-head">
              <span className="feature-icon">
                <Award size={22} />
              </span>
              <div>
                <h3>{q.name}</h3>
                <small className="muted">{q.issuer}</small>
              </div>
              <Badge>{q.status}</Badge>
            </div>
            <div className="qualification-meta">
              <span>
                Valid from<strong>{dateLabel(q.validFrom)}</strong>
              </span>
              <span>
                Valid until<strong>{dateLabel(q.expiresOn)}</strong>
              </span>
              <span>
                Verification
                <Badge>
                  {q.verification === "VERIFIED"
                    ? "Verified"
                    : "Pending review"}
                </Badge>
              </span>
            </div>
            <div className="document-links">
              {ds
                .filter((d) => d.qualificationId === q.id)
                .map((d) => (
                  <a
                    key={d.id}
                    href={`/api/public/${token}/documents/${d.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Files size={16} />
                    {d.originalName}
                    <ExternalLink size={13} />
                  </a>
                ))}
              {!ds.some((d) => d.qualificationId === q.id) && (
                <small className="muted">No supporting document uploaded</small>
              )}
            </div>
          </article>
        ))}
        {!qs.length && (
          <section className="card">
            <Empty
              title="No qualifications recorded yet"
              description="Contact the employer’s HR team for more information."
            />
          </section>
        )}
        <p className="public-note">
          Records maintained by {company.name}. Status checked{" "}
          {dateLabel(new Date().toISOString())} (UTC).
          <br />
          Verification reflects the employer’s review of evidence. Site or task
          authorization may require additional checks.
        </p>
      </div>
    </main>
  );
}

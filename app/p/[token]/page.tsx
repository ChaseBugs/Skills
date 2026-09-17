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
import { LangSwitch } from "@/components/lang-switch";
import { getServerLocale } from "@/lib/locale";
import {
  getDictionary,
  statusLabel,
  statusTone,
  verificationLabel,
  verificationTone,
} from "@/lib/i18n";
export const dynamic = "force-dynamic";
export default async function Passport({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale = await getServerLocale();
  const t = getDictionary(locale);
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
          <span>{t.publicProfile.tag}</span>
          <LangSwitch compact />
        </header>
        <section className="card public-identity">
          <Avatar name={e.name} photoId={e.photoId} publicToken={token} large />
          <h1>{e.name}</h1>
          <p>{e.jobTitle}</p>
          <div className="public-company">
            <Building2 size={14} />
            {company.name}
          </div>
          <Badge tone="success">{t.status.active}</Badge>
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
              <span>{t.publicProfile.verifiedAndValid}</span>
            </div>
            <div>
              <strong>
                {qs.filter((q) => q.status === "Expiring soon").length}
              </strong>
              <span>{t.publicProfile.expiringSoon}</span>
            </div>
            <div>
              <strong>{ds.filter((d) => d.kind === "DIPLOMA").length}</strong>
              <span>{t.publicProfile.supportingDocuments}</span>
            </div>
          </div>
        </section>
        <div className="public-section-title">
          <h2>{t.publicProfile.sectionTitle}</h2>
          <span>{t.publicProfile.records(qs.length)}</span>
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
              <Badge tone={statusTone(q.status)}>
                {statusLabel(q.status, t)}
              </Badge>
            </div>
            <div className="qualification-meta">
              <span>
                {t.publicProfile.validFrom}
                <strong>{dateLabel(q.validFrom)}</strong>
              </span>
              <span>
                {t.publicProfile.validUntil}
                <strong>{dateLabel(q.expiresOn)}</strong>
              </span>
              <span>
                {t.publicProfile.verification}
                <Badge tone={verificationTone(q.verification)}>
                  {verificationLabel(q.verification, t)}
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
                <small className="muted">{t.publicProfile.noDocument}</small>
              )}
            </div>
          </article>
        ))}
        {!qs.length && (
          <section className="card">
            <Empty
              title={t.publicProfile.noneYet}
              description={t.publicProfile.noneYetDesc}
            />
          </section>
        )}
        <p className="public-note">
          {t.publicProfile.maintainedBy(
            company.name,
            dateLabel(new Date().toISOString()),
          )}
          <br />
          {t.publicProfile.verificationNote}
        </p>
      </div>
    </main>
  );
}

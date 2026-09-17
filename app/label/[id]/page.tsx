import QRCode from "qrcode";
import { redirect, notFound } from "next/navigation";
import { currentUser, memberships } from "@/lib/auth";
import { rows } from "@/lib/db";
import { employeeColumns } from "@/lib/data";
import type { Employee } from "@/lib/domain";
import { Avatar } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { getServerLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
export const dynamic = "force-dynamic";
export default async function Label({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const t = getDictionary(await getServerLocale());
  const { id } = await params;
  const e = (
    await rows<Employee>(
      `SELECT ${employeeColumns} FROM employees WHERE id=?`,
      [id],
    )
  )[0];
  if (!e || !e.active) notFound();
  const company = (await memberships(user.id)).find(
    (c) => c.id === e.companyId,
  );
  if (!company) notFound();
  const url =
    (process.env.APP_URL || "http://localhost:3100") + "/p/" + e.qrToken;
  const qr = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 400,
  });
  return (
    <main className="print-page">
      <div className="print-toolbar">
        <div>
          <h1>{t.label.title}</h1>
          <p>{t.label.subtitle}</p>
        </div>
        <PrintButton />
      </div>
      <section className="helmet-label">
        <Avatar name={e.name} photoId={e.photoId} large />
        <div>
          <h2>{e.name}</h2>
          <p>{company.name}</p>
          <small>{t.label.scanNote}</small>
        </div>
        <img src={qr} alt={"QR code for " + e.name} />
      </section>
      <div className="print-notes">
        {!e.photoId && <p>{t.label.addPhoto}</p>}
        <p>{t.label.widthNote}</p>
        <p>
          {t.label.destination} <a href={url}>{url}</a>
        </p>
        <p>{t.label.domainNote}</p>
      </div>
    </main>
  );
}

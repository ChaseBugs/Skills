import QRCode from "qrcode";
import { redirect, notFound } from "next/navigation";
import { currentUser, memberships } from "@/lib/auth";
import { rows } from "@/lib/db";
import { employeeColumns } from "@/lib/data";
import type { Employee } from "@/lib/domain";
import { Avatar } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
export const dynamic = "force-dynamic";
export default async function Label({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
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
          <h1>Helmet label</h1>
          <p>Print at actual size, then check the QR with a phone.</p>
        </div>
        <PrintButton />
      </div>
      <section className="helmet-label">
        <Avatar name={e.name} photoId={e.photoId} large />
        <div>
          <h2>{e.name}</h2>
          <p>{company.name}</p>
          <small>Scan for skills & diplomas</small>
        </div>
        <img src={qr} alt={"QR code for " + e.name} />
      </section>
      <div className="print-notes">
        {!e.photoId && (
          <p>Add an employee photograph before printing the final label.</p>
        )}
        <p>
          Label width: 105 mm. Use a durable label suitable for your equipment.
        </p>
        <p>
          Destination: <a href={url}>{url}</a>
        </p>
        <p>
          The QR must use your public domain before labels are issued. A
          localhost link is only usable on this computer.
        </p>
      </div>
    </main>
  );
}

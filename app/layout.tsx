import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Skills · Workforce credentials",
  description:
    "Manage employee competencies, qualifications and digital skills passports.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

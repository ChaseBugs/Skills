import type { Metadata } from "next";
import "./globals.css";
import { getServerLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { LocaleProvider } from "@/components/locale-provider";
export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getServerLocale());
  return {
    title: t.meta.title,
    description: t.meta.description,
    robots: { index: false, follow: false },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}

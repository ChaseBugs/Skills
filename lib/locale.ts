import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from "./i18n";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const acceptLanguage = (await headers()).get("accept-language") || "";
  if (/^fr\b|,\s*fr\b/i.test(acceptLanguage)) return "fr";
  return defaultLocale;
}

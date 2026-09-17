"use client";
import { useLocale } from "./locale-provider";

export function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <div
      className={"lang-switch " + (compact ? "compact" : "")}
      role="group"
      aria-label={t.topbar.language}
    >
      <button
        type="button"
        className={locale === "en" ? "active" : ""}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={locale === "fr" ? "active" : ""}
        aria-pressed={locale === "fr"}
        onClick={() => setLocale("fr")}
      >
        FR
      </button>
    </div>
  );
}

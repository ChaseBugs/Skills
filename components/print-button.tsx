"use client";
import { Printer } from "lucide-react";
import { useLocale } from "./locale-provider";
export function PrintButton() {
  const { t } = useLocale();
  return (
    <button className="button primary" onClick={() => window.print()}>
      <Printer size={17} />
      {t.label.printLabel}
    </button>
  );
}

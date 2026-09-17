"use client";
import { Printer } from "lucide-react";
export function PrintButton() {
  return (
    <button className="button primary" onClick={() => window.print()}>
      <Printer size={17} />
      Print label
    </button>
  );
}

"use client";
import { useEffect, useRef } from "react";
import { X, FileCheck2 } from "lucide-react";
import { initials } from "@/lib/domain";
import { useLocale } from "./locale-provider";
export function Avatar({
  name,
  photoId,
  large = false,
  publicToken,
}: {
  name: string;
  photoId?: string | null;
  large?: boolean;
  publicToken?: string;
}) {
  return (
    <span
      className={"avatar " + (large ? "large" : "")}
      style={
        {
          "--avatar-hue": String(
            ([...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 200) + 100,
          ),
        } as React.CSSProperties
      }
    >
      {photoId ? (
        <img
          src={
            publicToken
              ? `/api/public/${publicToken}/documents/${photoId}`
              : `/api/documents/${photoId}`
          }
          alt={name}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
export function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "success" | "danger" | "warning" | "neutral";
}) {
  const text = String(children);
  const resolved =
    tone ||
    (["Valid", "Verified", "Active", "HR"].includes(text)
      ? "success"
      : ["Expired", "Revoked", "Inactive"].includes(text)
        ? "danger"
        : ["Expiring soon", "Pending review"].includes(text)
          ? "warning"
          : "neutral");
  return (
    <span className={"badge " + resolved}>
      <i />
      {children}
    </span>
  );
}
export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty">
      <FileCheck2 size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useLocale();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label={t.modal.closeDialog}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

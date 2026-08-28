"use client";
import { AlertTriangle } from "lucide-react";
import { Dialog } from "./dialog";

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", pending = false, tone = "danger" }: { open: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; title: string; description: string; confirmLabel?: string; pending?: boolean; tone?: "danger" | "warning" }) {
  return <Dialog open={open} onClose={onClose} title={title} eyebrow="Please confirm"><div className="confirmation-content"><span className={`confirmation-icon ${tone}`}><AlertTriangle /></span><p>{description}</p><div className="confirmation-actions"><button className="secondary-button" onClick={onClose} disabled={pending}>Cancel</button><button className="destructive-button" onClick={onConfirm} disabled={pending}>{pending ? "Please wait…" : confirmLabel}</button></div></div></Dialog>;
}

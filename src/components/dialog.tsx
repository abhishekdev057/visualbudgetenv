"use client";
import { X } from "lucide-react";
import { useEffect } from "react";
export function Dialog({ open, onClose, title, eyebrow, children }: { open: boolean; onClose: () => void; title: string; eyebrow?: string; children: React.ReactNode }) {
  useEffect(() => { if (!open) return; const key = (event: KeyboardEvent) => event.key === "Escape" && onClose(); document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key); }, [open, onClose]);
  if (!open) return null;
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="dialog-handle"/><header><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2 id="dialog-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X /></button></header>{children}</section></div>;
}

"use client";
import { Download, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { Dialog } from "./dialog";

export function SettingsActions({ hasPassword = true }: { hasPassword?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    try { await apiRequest("/api/v1/auth/logout", { method: "POST" }); router.push("/sign-in"); router.refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not sign out"); }
    finally { setPending(false); }
  }
  async function remove(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest("/api/v1/account", { method: "DELETE", body: JSON.stringify({ ...(hasPassword ? { password: form.get("password") } : {}), confirmation: form.get("confirmation") }) });
      router.push("/sign-up"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete account"); }
    finally { setPending(false); }
  }
  return <><div className="settings-actions"><a className="settings-row" href="/api/v1/export" download><span><Download /></span><div><strong>Export my data</strong><small>Download your budgets and activity as JSON</small></div><b>↓</b></a><button className="settings-row" onClick={logout} disabled={pending}><span><LogOut /></span><div><strong>Sign out</strong><small>End this session securely</small></div><b>›</b></button><button className="settings-row danger-row" onClick={() => setOpen(true)}><span><Trash2 /></span><div><strong>Delete account</strong><small>Permanently erase your account and financial data</small></div><b>›</b></button></div>
    <Dialog open={open} onClose={() => setOpen(false)} title="Delete your account" eyebrow="Permanent action"><form className="form-grid" onSubmit={remove}><p className="dialog-copy">Every budget, envelope, transaction, session, and profile record will be permanently deleted. This cannot be undone.</p>{hasPassword&&<label><span>Current password</span><input type="password" name="password" autoComplete="current-password" minLength={8} required /></label>}<label><span>Type DELETE to confirm</span><input name="confirmation" autoComplete="off" pattern="DELETE" required /></label><div className="confirmation-actions"><button type="button" className="secondary-button" onClick={() => setOpen(false)} disabled={pending}>Cancel</button><button className="destructive-button" disabled={pending}>{pending ? "Deleting…" : "Delete everything"}</button></div></form></Dialog></>;
}

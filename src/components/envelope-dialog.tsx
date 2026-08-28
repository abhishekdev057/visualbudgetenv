"use client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { iconNames, EnvelopeIcon } from "./icon";
import { Dialog } from "./dialog";
export function EnvelopeDialog({ budgetId }: { budgetId: string }) {
  const [open, setOpen] = useState(false); const [pending, setPending] = useState(false); const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); const data = new FormData(event.currentTarget); try { await apiRequest(`/api/v1/budgets/${budgetId}/envelopes`, { method: "POST", body: JSON.stringify({ name: data.get("name"), allocatedAmount: data.get("allocatedAmount"), type: data.get("type"), icon: data.get("icon"), accent: data.get("accent") }) }); toast.success("Envelope created"); setOpen(false); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create envelope"); } finally { setPending(false); } }
  return <><button className="secondary-button" onClick={() => setOpen(true)}><Plus /> New envelope</button><Dialog open={open} onClose={() => setOpen(false)} eyebrow="Budget category" title="Create an envelope"><form className="form-grid" onSubmit={submit}><label><span>Name</span><input name="name" placeholder="e.g. Groceries" required maxLength={60} autoFocus /></label><label><span>Monthly allocation</span><div className="money-input"><b>₹</b><input name="allocatedAmount" inputMode="decimal" placeholder="0" pattern="\d+(\.\d{1,2})?" required /></div></label><div className="field-row"><label><span>Type</span><select name="type"><option value="expense">Expense</option><option value="savings">Savings</option></select></label><label><span>Accent</span><select name="accent"><option value="amber">Amber</option><option value="violet">Violet</option><option value="cyan">Cyan</option><option value="rose">Rose</option><option value="emerald">Emerald</option><option value="blue">Blue</option></select></label></div><fieldset className="icon-picker"><legend>Icon</legend>{iconNames.map(name => <label key={name}><input type="radio" name="icon" value={name} defaultChecked={name === "WalletCards"} /><span><EnvelopeIcon name={name} /></span></label>)}</fieldset><button className="primary-button" disabled={pending}>{pending ? "Creating…" : "Create envelope"}</button></form></Dialog></>;
}

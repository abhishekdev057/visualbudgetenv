"use client";
import { PiggyBank, Plus } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { BudgetSummary } from "./balance-hero";
import { ExpenseDialog } from "./expense-dialog";

export function SavingsVault({ budget }: { budget: BudgetSummary }) {
  const savings = budget.envelopes.filter((item) => item.type === "savings");
  const saved = savings.reduce((sum, item) => sum + Number(item.saved), 0);
  const target = Number(budget.savingsAllocation);
  const progress = target > 0 ? Math.min(100, Math.round(saved / target * 100)) : 0;
  return <section className="savings-vault"><div className="vault-glow"/><div className="vault-copy"><span className="eyebrow">Savings vault</span><h2>Your future fund</h2><p>Move money into a savings envelope and watch this month’s target fill up.</p><div className="vault-total"><strong>{formatMoney(String(saved))}</strong><span>saved of {formatMoney(String(target))}</span></div><div className="vault-progress"><span style={{width:`${progress}%`}}/></div></div><div className="vault-visual"><span><PiggyBank/></span><b>{progress}%</b></div>{savings.length ? <ExpenseDialog budget={budget} kind="saving" trigger={<button className="primary-button"><Plus/>Add savings</button>}/> : null}</section>;
}

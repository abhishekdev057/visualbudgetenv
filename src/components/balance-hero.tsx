"use client";
import { Eye, EyeOff, Plus } from "lucide-react";
import { useState } from "react";
import { formatMoney } from "@/lib/utils";
import { ExpenseDialog } from "./expense-dialog";

export type EnvelopeSummary = { id: string; name: string; icon: string; accent: string; type: "expense" | "savings"; allocatedAmount: string; spent: string; saved: string; remaining: string; used: number; label: string; tone: string; transactionCount: number };
export type BudgetSummary = { id: string; year: number; month: number; income: string; totalAllocated: string; unallocated: string; totalSpent: string; available: string; savingsAllocation: string; savingsRate: number; allocationUsed: number; envelopes: EnvelopeSummary[] };
export function BalanceHero({ budget }: { budget: BudgetSummary }) {
  const [hidden, setHidden] = useState(false); const show = (value: string) => hidden ? "₹ •••••" : formatMoney(value);
  return <section className="balance-hero"><div className="hero-top"><div><span>Available this month</span><div className="balance-line"><strong>{show(budget.available)}</strong><button onClick={() => setHidden(!hidden)} aria-label={hidden ? "Reveal amounts" : "Hide amounts"}>{hidden ? <Eye /> : <EyeOff />}</button></div></div><ExpenseDialog budget={budget} trigger={<button className="round-action"><Plus /> <span>Expense</span></button>} /></div>
    <div className="hero-metrics"><div><span>Income</span><strong>{show(budget.income)}</strong></div><div><span>Allocated</span><strong>{show(budget.totalAllocated)}</strong></div><div><span>Spent</span><strong>{show(budget.totalSpent)}</strong></div><div><span>Savings plan</span><strong className="positive">{show(budget.savingsAllocation)}</strong></div><div><span>Unallocated</span><strong className={Number(budget.unallocated) < 0 ? "danger" : "gold"}>{show(budget.unallocated)}</strong></div></div></section>;
}

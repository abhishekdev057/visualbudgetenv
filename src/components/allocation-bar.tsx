import { formatMoney } from "@/lib/utils";
import type { BudgetSummary } from "./balance-hero";
export function AllocationBar({ budget }: { budget: BudgetSummary }) {
  const positiveIncome = Math.max(Number(budget.income), 1);
  return <section className="panel allocation-panel"><div className="section-heading"><div><span className="eyebrow">Allocation</span><h2>Where your money goes</h2></div><strong>{budget.allocationUsed}% assigned</strong></div>
    <div className="segmented-bar" aria-label={`${budget.allocationUsed}% of income allocated`}>{budget.envelopes.map((item) => <div key={item.id} className={`segment ${item.accent}`} style={{ width: `${Math.max(Number(item.allocatedAmount) / positiveIncome * 100, 0)}%` }} title={`${item.name}: ${formatMoney(item.allocatedAmount)} allocated, ${formatMoney(item.spent)} spent`} />)}<div className="segment unallocated" style={{ width: `${Math.max(Number(budget.unallocated) / positiveIncome * 100, 0)}%` }} /></div>
    <div className="allocation-legend">{budget.envelopes.slice(0, 5).map((item) => <span key={item.id}><i className={item.accent} />{item.name}</span>)}{Number(budget.unallocated) > 0 && <span><i className="muted" />Unallocated</span>}</div></section>;
}

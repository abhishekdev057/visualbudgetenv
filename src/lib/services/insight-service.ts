import { money, percentage } from "@/lib/finance";
import { getBudgetSummary } from "./budget-service";

export async function getInsights(userId: string, budgetId: string) {
  const budget = await getBudgetSummary(userId, budgetId);
  const insights: { id: string; title: string; body: string; tone: "neutral" | "warning" | "success" }[] = [];
  const expenses = budget.envelopes.filter((item) => item.type === "expense" && money(item.spent).gt(0)).sort((a, b) => money(b.spent).cmp(a.spent));
  if (expenses[0]) insights.push({ id: "largest", title: "Biggest category", body: `${expenses[0].name} is your largest spending category this month.`, tone: "neutral" });
  for (const envelope of budget.envelopes.filter((item) => item.used > 70 && item.type === "expense")) insights.push({ id: `warning-${envelope.id}`, title: envelope.label, body: `You have used ${envelope.used}% of your ${envelope.name} budget.`, tone: "warning" });
  if (money(budget.unallocated).gt(0)) insights.push({ id: "unallocated", title: "Money without a purpose", body: `You still have ₹${Number(budget.unallocated).toLocaleString("en-IN")} unallocated.`, tone: "neutral" });
  if (budget.savingsRate > 0) insights.push({ id: "savings", title: "Savings plan", body: `${budget.savingsRate}% of this month’s income is allocated to savings.`, tone: "success" });
  return { budget, insights, spendingByCategory: expenses.map((item) => ({ name: item.name, amount: item.spent, percentage: percentage(item.spent, budget.totalSpent), accent: item.accent })) };
}
import "server-only";

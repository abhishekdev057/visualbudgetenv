import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { money, percentage } from "@/lib/finance";
import { findBudgetByMonth, getBudgetSummary } from "./budget-service";

export async function getInsights(userId: string, budgetId: string) {
  const budget = await getBudgetSummary(userId, budgetId);
  const insights: { id: string; title: string; body: string; tone: "neutral" | "warning" | "success" }[] = [];
  const expenses = budget.envelopes.filter((item) => item.type === "expense" && money(item.spent).gt(0)).sort((a, b) => money(b.spent).cmp(a.spent));
  if (expenses[0]) insights.push({ id: "largest", title: "Biggest category", body: `${expenses[0].name} is your largest spending category this month.`, tone: "neutral" });
  for (const envelope of budget.envelopes.filter((item) => item.used > 70 && item.type === "expense")) insights.push({ id: `warning-${envelope.id}`, title: envelope.label, body: `You have used ${envelope.used}% of your ${envelope.name} budget.`, tone: "warning" });
  if (money(budget.unallocated).gt(0)) insights.push({ id: "unallocated", title: "Money without a purpose", body: `You still have ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(money(budget.unallocated).toNumber())} unallocated.`, tone: "neutral" });
  if (budget.savingsRate > 0) insights.push({ id: "savings", title: "Savings plan", body: `${budget.savingsRate}% of this month’s income is allocated to savings.`, tone: "success" });

  const dailyTrend = await db.select({
    date: sql<string>`to_char(date_trunc('day', ${transactions.transactionDate}), 'YYYY-MM-DD')`,
    amount: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
  }).from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.budgetMonthId, budgetId), eq(transactions.type, "expense")))
    .groupBy(sql`date_trunc('day', ${transactions.transactionDate})`).orderBy(asc(sql`date_trunc('day', ${transactions.transactionDate})`));

  const previousDate = new Date(budget.year, budget.month - 2, 1);
  const previous = await findBudgetByMonth(userId, previousDate.getFullYear(), previousDate.getMonth() + 1);
  let monthComparison: { percentage: number; direction: "more" | "less"; previousSpent: string } | null = null;
  if (previous) {
    const previousSummary = await getBudgetSummary(userId, previous.id);
    if (money(previousSummary.totalSpent).gt(0) && money(budget.totalSpent).gt(0)) {
      const difference = money(budget.totalSpent).minus(previousSummary.totalSpent);
      monthComparison = { percentage: Math.abs(percentage(difference, previousSummary.totalSpent)), direction: difference.gte(0) ? "more" : "less", previousSpent: previousSummary.totalSpent };
      insights.push({ id: "month-comparison", title: "Month over month", body: `You have spent ${monthComparison.percentage}% ${monthComparison.direction} than last month.`, tone: monthComparison.direction === "less" ? "success" : "neutral" });
    }
  }

  return { budget, insights, spendingByCategory: expenses.map((item) => ({ name: item.name, amount: item.spent, percentage: percentage(item.spent, budget.totalSpent), accent: item.accent })), dailyTrend, monthComparison };
}

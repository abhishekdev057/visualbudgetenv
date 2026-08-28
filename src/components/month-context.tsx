import { findBudgetByMonth, getBudgetSummary } from "@/lib/services/budget-service";
export async function getMonthData(userId: string, searchParams: Promise<{ year?: string; month?: string }>) {
  const params = await searchParams; const now = new Date(); const year = Number(params.year ?? now.getFullYear()); const month = Number(params.month ?? now.getMonth() + 1);
  const selected = await findBudgetByMonth(userId, year, month); return { year, month, budget: selected ? await getBudgetSummary(userId, selected.id) : null };
}

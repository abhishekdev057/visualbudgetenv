import { findBudgetByMonth, getBudgetSummary } from "@/lib/services/budget-service";
import { monthQuerySchema } from "@/lib/validation";
export async function getMonthData(userId: string, searchParams: Promise<{ year?: string; month?: string }>) {
  const params = await searchParams; const now = new Date(); const parsed = monthQuerySchema.safeParse({ year: params.year ?? now.getFullYear(), month: params.month ?? now.getMonth() + 1 }); const { year, month } = parsed.success ? parsed.data : { year: now.getFullYear(), month: now.getMonth() + 1 };
  const selected = await findBudgetByMonth(userId, year, month); return { year, month, budget: selected ? await getBudgetSummary(userId, selected.id) : null };
}

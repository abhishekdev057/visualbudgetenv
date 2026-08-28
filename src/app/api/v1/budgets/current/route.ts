import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api-response";
import { requireRequestUser } from "@/lib/auth";
import { findBudgetByMonth, getBudgetSummary } from "@/lib/services/budget-service";
import { monthQuerySchema } from "@/lib/validation";
export async function GET(request: NextRequest) {
  try { const user = await requireRequestUser(request); const now = new Date(); const { year, month } = monthQuerySchema.parse({ year: request.nextUrl.searchParams.get("year") ?? now.getFullYear(), month: request.nextUrl.searchParams.get("month") ?? now.getMonth() + 1 }); const budget = await findBudgetByMonth(user.id, year, month); return ok(budget ? await getBudgetSummary(user.id, budget.id) : null); } catch (error) { return apiError(error); }
}

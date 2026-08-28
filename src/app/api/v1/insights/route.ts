import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api-response";
import { requireRequestUser } from "@/lib/auth";
import { findBudgetByMonth } from "@/lib/services/budget-service";
import { getInsights } from "@/lib/services/insight-service";
import { monthQuerySchema } from "@/lib/validation";
export async function GET(request: NextRequest) { try { const user = await requireRequestUser(request); const now = new Date(); const input = monthQuerySchema.parse({ year: request.nextUrl.searchParams.get("year") ?? now.getFullYear(), month: request.nextUrl.searchParams.get("month") ?? now.getMonth() + 1 }); const budget = await findBudgetByMonth(user.id, input.year, input.month); return ok(budget ? await getInsights(user.id, budget.id) : null); } catch (error) { return apiError(error); } }

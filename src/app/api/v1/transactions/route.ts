import type { NextRequest } from "next/server";
import { apiError, created, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { findBudgetByMonth } from "@/lib/services/budget-service";
import { createTransaction, listTransactions } from "@/lib/services/transaction-service";
import { transactionInputSchema, transactionQuerySchema } from "@/lib/validation";
export async function GET(request: NextRequest) { try { const user = await requireRequestUser(request); const input = transactionQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams)); let budgetId = input.budgetId; if (!budgetId && input.year !== undefined && input.month !== undefined) { const budget = await findBudgetByMonth(user.id, input.year, input.month); if (!budget) return ok({ items: [], nextCursor: null }); budgetId = budget.id; } return ok(await listTransactions(user.id, { budgetId, envelopeId: input.envelopeId, search: input.search, from: input.from, to: input.to, limit: input.limit, cursor: input.cursor, sort: input.sort })); } catch (error) { return apiError(error); } }
export async function POST(request: NextRequest) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); return created(await createTransaction(user.id, transactionInputSchema.parse(await readJson(request)))); } catch (error) { return apiError(error); } }

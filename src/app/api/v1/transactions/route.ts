import type { NextRequest } from "next/server";
import { apiError, created, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { createTransaction, listTransactions } from "@/lib/services/transaction-service";
import { transactionInputSchema } from "@/lib/validation";
export async function GET(request: NextRequest) { try { const user = await requireRequestUser(request); const p = request.nextUrl.searchParams; return ok(await listTransactions(user.id, { budgetId: p.get("budgetId") ?? undefined, envelopeId: p.get("envelopeId") ?? undefined, search: p.get("search") ?? undefined, from: p.get("from") ? new Date(p.get("from")!) : undefined, to: p.get("to") ? new Date(p.get("to")!) : undefined, limit: p.get("limit") ? Number(p.get("limit")) : undefined, cursor: p.get("cursor") ?? undefined, sort: (p.get("sort") as "newest") ?? undefined })); } catch (error) { return apiError(error); } }
export async function POST(request: NextRequest) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); return created(await createTransaction(user.id, transactionInputSchema.parse(await readJson(request)))); } catch (error) { return apiError(error); } }

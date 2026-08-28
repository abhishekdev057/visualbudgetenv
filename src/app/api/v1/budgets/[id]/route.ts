import type { NextRequest } from "next/server";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { deleteBudget, getBudgetSummary, updateBudget } from "@/lib/services/budget-service";
import { budgetUpdateSchema, uuid } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Context) { try { const user = await requireRequestUser(request); const { id } = await params; return ok(await getBudgetSummary(user.id, uuid.parse(id))); } catch (error) { return apiError(error); } }
export async function PATCH(request: NextRequest, { params }: Context) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const { id } = await params; const input = budgetUpdateSchema.parse(await readJson(request)); return ok(await updateBudget(user.id, uuid.parse(id), input.income!)); } catch (error) { return apiError(error); } }
export async function DELETE(request: NextRequest, { params }: Context) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const { id } = await params; await deleteBudget(user.id, uuid.parse(id)); return ok({ deleted: true }); } catch (error) { return apiError(error); } }

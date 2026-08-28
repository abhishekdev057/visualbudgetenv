import type { NextRequest } from "next/server";
import { apiError, created, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { createBudget, listBudgets } from "@/lib/services/budget-service";
import { budgetCreateSchema } from "@/lib/validation";
export async function GET(request: NextRequest) { try { const user = await requireRequestUser(request); return ok(await listBudgets(user.id)); } catch (error) { return apiError(error); } }
export async function POST(request: NextRequest) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); return created(await createBudget(user.id, budgetCreateSchema.parse(await readJson(request)))); } catch (error) { return apiError(error); } }

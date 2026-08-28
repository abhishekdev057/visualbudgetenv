import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, created, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { copyBudget } from "@/lib/services/budget-service";
import { uuid } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
const schema = z.object({ year: z.number().int().min(2000).max(2200), month: z.number().int().min(1).max(12) });
export async function POST(request: NextRequest, { params }: Context) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const { id } = await params; const input = schema.parse(await readJson(request)); return created(await copyBudget(user.id, uuid.parse(id), input.year, input.month)); } catch (error) { return apiError(error); } }

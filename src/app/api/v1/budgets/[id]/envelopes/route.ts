import { and, asc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { envelopes } from "@/db/schema";
import { apiError, created, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { findBudget } from "@/lib/services/budget-service";
import { createEnvelope } from "@/lib/services/envelope-service";
import { envelopeInputSchema, uuid } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Context) { try { const user = await requireRequestUser(request); const { id: rawId } = await params; const id = uuid.parse(rawId); await findBudget(user.id, id); return ok(await db.select().from(envelopes).where(and(eq(envelopes.userId, user.id), eq(envelopes.budgetMonthId, id))).orderBy(asc(envelopes.sortOrder))); } catch (error) { return apiError(error); } }
export async function POST(request: NextRequest, { params }: Context) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const { id } = await params; return created(await createEnvelope(user.id, uuid.parse(id), envelopeInputSchema.parse(await readJson(request)))); } catch (error) { return apiError(error); } }

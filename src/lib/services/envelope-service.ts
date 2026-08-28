import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { envelopes, transactions } from "@/db/schema";
import { AppError, notFound } from "@/lib/errors";
import { money, moneyString } from "@/lib/finance";
import type { z } from "zod";
import type { envelopeInputSchema } from "@/lib/validation";
import { findBudget } from "./budget-service";

type EnvelopeInput = z.infer<typeof envelopeInputSchema>;
export async function findEnvelope(userId: string, id: string) {
  const [item] = await db.select().from(envelopes).where(and(eq(envelopes.id, id), eq(envelopes.userId, userId))).limit(1);
  if (!item) throw notFound("Envelope not found");
  return item;
}

async function validateAllocation(userId: string, budgetMonthId: string, value: string, excluding?: string) {
  const budget = await findBudget(userId, budgetMonthId);
  const conditions = [eq(envelopes.userId, userId), eq(envelopes.budgetMonthId, budgetMonthId)];
  if (excluding) conditions.push(ne(envelopes.id, excluding));
  const [row] = await db.select({ total: sql<string>`coalesce(sum(${envelopes.allocatedAmount}), 0)` }).from(envelopes).where(and(...conditions));
  if (money(row.total).plus(value).gt(budget.income)) throw new AppError("OVER_ALLOCATED", "This allocation exceeds the money still available", 422);
}

export async function createEnvelope(userId: string, budgetMonthId: string, input: EnvelopeInput) {
  await validateAllocation(userId, budgetMonthId, input.allocatedAmount);
  try {
    const [item] = await db.insert(envelopes).values({ ...input, allocatedAmount: moneyString(input.allocatedAmount), userId, budgetMonthId }).returning();
    return item;
  } catch (error) {
    if (error instanceof Error && error.message.includes("envelopes_budget_name_unique")) throw new AppError("DUPLICATE_ENVELOPE", "An envelope with this name already exists", 409);
    throw error;
  }
}

export async function updateEnvelope(userId: string, id: string, input: Partial<EnvelopeInput>) {
  const current = await findEnvelope(userId, id);
  if (input.allocatedAmount !== undefined) await validateAllocation(userId, current.budgetMonthId, input.allocatedAmount, id);
  const [item] = await db.update(envelopes).set({ ...input, ...(input.allocatedAmount !== undefined ? { allocatedAmount: moneyString(input.allocatedAmount) } : {}), updatedAt: new Date() })
    .where(and(eq(envelopes.id, id), eq(envelopes.userId, userId))).returning();
  return item;
}

export async function deleteEnvelope(userId: string, id: string, moveToEnvelopeId?: string) {
  const current = await findEnvelope(userId, id);
  const [count] = await db.select({ value: sql<number>`count(*)::int` }).from(transactions).where(and(eq(transactions.envelopeId, id), eq(transactions.userId, userId)));
  if (count.value && !moveToEnvelopeId) throw new AppError("ENVELOPE_HAS_TRANSACTIONS", "Move its transactions before deleting this envelope", 409, { transactionCount: count.value });
  if (moveToEnvelopeId) {
    const target = await findEnvelope(userId, moveToEnvelopeId);
    if (target.budgetMonthId !== current.budgetMonthId || target.id === current.id) throw new AppError("INVALID_MOVE_TARGET", "Choose another envelope from the same month", 422);
    await db.transaction(async (tx) => {
      await tx.update(transactions).set({ envelopeId: target.id, updatedAt: new Date() }).where(and(eq(transactions.userId, userId), eq(transactions.envelopeId, id)));
      await tx.delete(envelopes).where(and(eq(envelopes.userId, userId), eq(envelopes.id, id)));
    });
  } else await db.delete(envelopes).where(and(eq(envelopes.userId, userId), eq(envelopes.id, id)));
}
import "server-only";

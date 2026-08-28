import { and, asc, desc, eq, gt, gte, ilike, lt, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { budgetMonths, envelopes, transactions } from "@/db/schema";
import { AppError, notFound } from "@/lib/errors";
import { moneyString } from "@/lib/finance";
import type { z } from "zod";
import type { transactionInputSchema, transactionUpdateSchema } from "@/lib/validation";
import { findBudget } from "./budget-service";
import { findEnvelope } from "./envelope-service";

type TransactionInput = z.infer<typeof transactionInputSchema>;
type TransactionUpdate = z.infer<typeof transactionUpdateSchema>;
async function validateRelations(userId: string, budgetId: string, envelopeId: string) {
  const [budget, envelope] = await Promise.all([findBudget(userId, budgetId), findEnvelope(userId, envelopeId)]);
  if (envelope.budgetMonthId !== budget.id) throw new AppError("ENVELOPE_BUDGET_MISMATCH", "Envelope does not belong to the selected month", 422);
  return envelope;
}

export async function createTransaction(userId: string, input: TransactionInput) {
  const envelope = await validateRelations(userId, input.budgetMonthId, input.envelopeId);
  const [item] = await db.insert(transactions).values({ ...input, amount: moneyString(input.amount), userId, type: envelope.type === "savings" ? "saving" : "expense" }).returning();
  return item;
}

export async function findTransaction(userId: string, id: string) {
  const [item] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).limit(1);
  if (!item) throw notFound("Transaction not found");
  return item;
}

export async function updateTransaction(userId: string, id: string, input: TransactionUpdate) {
  const current = await findTransaction(userId, id);
  const budgetId = input.budgetMonthId ?? current.budgetMonthId;
  const envelopeId = input.envelopeId ?? current.envelopeId;
  const envelope = await validateRelations(userId, budgetId, envelopeId);
  const [item] = await db.update(transactions).set({ ...input, ...(input.amount ? { amount: moneyString(input.amount) } : {}), type: envelope.type === "savings" ? "saving" : "expense", updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId))).returning();
  return item;
}

export async function deleteTransaction(userId: string, id: string) {
  const item = await findTransaction(userId, id);
  await db.delete(transactions).where(and(eq(transactions.id, item.id), eq(transactions.userId, userId)));
}

export type TransactionQuery = { budgetId?: string; envelopeId?: string; search?: string; from?: Date; to?: Date; limit?: number; cursor?: string; sort?: "newest" | "oldest" | "highest" | "lowest" };
export async function listTransactions(userId: string, query: TransactionQuery = {}) {
  const limit = Math.min(Math.max(query.limit ?? 30, 1), 100);
  const conditions = [eq(transactions.userId, userId)];
  if (query.budgetId) conditions.push(eq(transactions.budgetMonthId, query.budgetId));
  if (query.envelopeId) conditions.push(eq(transactions.envelopeId, query.envelopeId));
  if (query.from) conditions.push(gte(transactions.transactionDate, query.from));
  if (query.to) conditions.push(lte(transactions.transactionDate, query.to));
  if (query.search) conditions.push(or(ilike(transactions.title, `%${query.search}%`), ilike(transactions.merchant, `%${query.search}%`))!);
  if (query.cursor && query.sort === "oldest") conditions.push(gt(transactions.transactionDate, new Date(query.cursor)));
  else if (query.cursor && query.sort === "highest") conditions.push(lt(transactions.amount, query.cursor));
  else if (query.cursor && query.sort === "lowest") conditions.push(gt(transactions.amount, query.cursor));
  else if (query.cursor) conditions.push(lt(transactions.transactionDate, new Date(query.cursor)));
  const ordering = query.sort === "oldest" ? asc(transactions.transactionDate) : query.sort === "highest" ? desc(transactions.amount) : query.sort === "lowest" ? asc(transactions.amount) : desc(transactions.transactionDate);
  const rows = await db.select({
    id: transactions.id, title: transactions.title, amount: transactions.amount, transactionDate: transactions.transactionDate,
    note: transactions.note, merchant: transactions.merchant, type: transactions.type, envelopeId: transactions.envelopeId,
    envelopeName: envelopes.name, envelopeIcon: envelopes.icon, envelopeAccent: envelopes.accent,
    budgetMonthId: transactions.budgetMonthId, year: budgetMonths.year, month: budgetMonths.month,
  }).from(transactions).innerJoin(envelopes, eq(envelopes.id, transactions.envelopeId)).innerJoin(budgetMonths, eq(budgetMonths.id, transactions.budgetMonthId))
    .where(and(...conditions)).orderBy(ordering, desc(transactions.id)).limit(limit + 1);
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const last = data.at(-1);
  const nextCursor = hasMore && last ? (query.sort === "highest" || query.sort === "lowest" ? last.amount : last.transactionDate.toISOString()) : null;
  return { items: data, nextCursor };
}
import "server-only";

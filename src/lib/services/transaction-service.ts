import "server-only";
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
type CursorPayload = { value: string; id: string };
function decodeCursor(cursor: string): CursorPayload {
  try {
    const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as CursorPayload;
    if (!value.value || !value.id) throw new Error();
    return value;
  } catch {
    throw new AppError("INVALID_CURSOR", "Pagination cursor is invalid", 422);
  }
}
function encodeCursor(value: CursorPayload) { return Buffer.from(JSON.stringify(value)).toString("base64url"); }

export async function listTransactions(userId: string, query: TransactionQuery = {}) {
  const limit = Math.min(Math.max(query.limit ?? 30, 1), 100);
  const sort = query.sort ?? "newest";
  const conditions = [eq(transactions.userId, userId)];
  if (query.budgetId) conditions.push(eq(transactions.budgetMonthId, query.budgetId));
  if (query.envelopeId) conditions.push(eq(transactions.envelopeId, query.envelopeId));
  if (query.from) conditions.push(gte(transactions.transactionDate, query.from));
  if (query.to) conditions.push(lte(transactions.transactionDate, query.to));
  if (query.search) conditions.push(or(ilike(transactions.title, `%${query.search}%`), ilike(transactions.merchant, `%${query.search}%`))!);
  if (query.cursor) {
    const cursor = decodeCursor(query.cursor);
    if (sort === "oldest") conditions.push(or(gt(transactions.transactionDate, new Date(cursor.value)), and(eq(transactions.transactionDate, new Date(cursor.value)), gt(transactions.id, cursor.id)))!);
    else if (sort === "highest") conditions.push(or(lt(transactions.amount, cursor.value), and(eq(transactions.amount, cursor.value), lt(transactions.id, cursor.id)))!);
    else if (sort === "lowest") conditions.push(or(gt(transactions.amount, cursor.value), and(eq(transactions.amount, cursor.value), gt(transactions.id, cursor.id)))!);
    else conditions.push(or(lt(transactions.transactionDate, new Date(cursor.value)), and(eq(transactions.transactionDate, new Date(cursor.value)), lt(transactions.id, cursor.id)))!);
  }
  const ordering = sort === "oldest" ? [asc(transactions.transactionDate), asc(transactions.id)] : sort === "highest" ? [desc(transactions.amount), desc(transactions.id)] : sort === "lowest" ? [asc(transactions.amount), asc(transactions.id)] : [desc(transactions.transactionDate), desc(transactions.id)];
  const rows = await db.select({
    id: transactions.id, title: transactions.title, amount: transactions.amount, transactionDate: transactions.transactionDate,
    note: transactions.note, merchant: transactions.merchant, type: transactions.type, envelopeId: transactions.envelopeId,
    envelopeName: envelopes.name, envelopeIcon: envelopes.icon, envelopeAccent: envelopes.accent,
    budgetMonthId: transactions.budgetMonthId, year: budgetMonths.year, month: budgetMonths.month,
  }).from(transactions).innerJoin(envelopes, eq(envelopes.id, transactions.envelopeId)).innerJoin(budgetMonths, eq(budgetMonths.id, transactions.budgetMonthId))
    .where(and(...conditions)).orderBy(...ordering).limit(limit + 1);
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const last = data.at(-1);
  const nextCursor = hasMore && last ? encodeCursor({ value: sort === "highest" || sort === "lowest" ? last.amount : last.transactionDate.toISOString(), id: last.id }) : null;
  return { items: data, nextCursor };
}

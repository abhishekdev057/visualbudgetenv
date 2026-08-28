import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgetMonths, envelopes, transactions } from "@/db/schema";
import { AppError, notFound } from "@/lib/errors";
import { calculateSummary, envelopeStatus, money, moneyString, percentage, sumMoney } from "@/lib/finance";
import type { z } from "zod";
import type { budgetCreateSchema } from "@/lib/validation";

export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;

export async function listBudgets(userId: string) {
  return db.select().from(budgetMonths).where(eq(budgetMonths.userId, userId)).orderBy(desc(budgetMonths.year), desc(budgetMonths.month));
}

export async function findBudget(userId: string, id: string) {
  const [budget] = await db.select().from(budgetMonths).where(and(eq(budgetMonths.id, id), eq(budgetMonths.userId, userId))).limit(1);
  if (!budget) throw notFound("Budget month not found");
  return budget;
}

export async function findBudgetByMonth(userId: string, year: number, month: number) {
  const [budget] = await db.select().from(budgetMonths).where(and(eq(budgetMonths.userId, userId), eq(budgetMonths.year, year), eq(budgetMonths.month, month))).limit(1);
  return budget ?? null;
}

export async function createBudget(userId: string, input: BudgetCreateInput) {
  const total = money(sumMoney(input.envelopes.map((item) => item.allocatedAmount)));
  if (total.gt(input.income)) throw new AppError("OVER_ALLOCATED", "Envelope allocations cannot exceed monthly income", 422);
  const duplicateNames = new Set(input.envelopes.map((item) => item.name.trim().toLowerCase()));
  if (duplicateNames.size !== input.envelopes.length) throw new AppError("DUPLICATE_ENVELOPE", "Envelope names must be unique", 422);
  const exists = await findBudgetByMonth(userId, input.year, input.month);
  if (exists) throw new AppError("BUDGET_EXISTS", "A budget already exists for this month", 409);

  const budget = await db.transaction(async (tx) => {
    const [budget] = await tx.insert(budgetMonths).values({ userId, year: input.year, month: input.month, income: moneyString(input.income) }).returning();
    if (input.envelopes.length) await tx.insert(envelopes).values(input.envelopes.map((item, index) => ({
      userId, budgetMonthId: budget.id, name: item.name, icon: item.icon, accent: item.accent, type: item.type,
      allocatedAmount: moneyString(item.allocatedAmount), sortOrder: index,
    })));
    return budget;
  });
  return getBudgetSummary(userId, budget.id);
}

export async function updateBudget(userId: string, id: string, income: string) {
  const budget = await findBudget(userId, id);
  const [allocation] = await db.select({ total: sql<string>`coalesce(sum(${envelopes.allocatedAmount}), 0)` }).from(envelopes).where(and(eq(envelopes.userId, userId), eq(envelopes.budgetMonthId, id)));
  if (money(income).lt(allocation.total)) throw new AppError("BELOW_ALLOCATED", "Income cannot be lower than the amount already allocated", 422);
  const [updated] = await db.update(budgetMonths).set({ income: moneyString(income), updatedAt: new Date() }).where(and(eq(budgetMonths.id, budget.id), eq(budgetMonths.userId, userId))).returning();
  return updated;
}

export async function deleteBudget(userId: string, id: string) {
  await findBudget(userId, id);
  await db.delete(budgetMonths).where(and(eq(budgetMonths.id, id), eq(budgetMonths.userId, userId)));
}

export async function copyBudget(userId: string, sourceId: string, year: number, month: number) {
  const source = await findBudget(userId, sourceId);
  const sourceEnvelopes = await db.select().from(envelopes).where(and(eq(envelopes.userId, userId), eq(envelopes.budgetMonthId, sourceId))).orderBy(asc(envelopes.sortOrder));
  return createBudget(userId, { year, month, income: source.income, envelopes: sourceEnvelopes.map(({ name, icon, accent, type, allocatedAmount }) => ({ name, icon, accent: accent as "amber", type, allocatedAmount })) });
}

export async function getBudgetSummary(userId: string, id: string, database = db) {
  const [budget] = await database.select().from(budgetMonths).where(and(eq(budgetMonths.id, id), eq(budgetMonths.userId, userId))).limit(1);
  if (!budget) throw notFound("Budget month not found");
  const envelopeRows = await database.select({
    id: envelopes.id, name: envelopes.name, icon: envelopes.icon, accent: envelopes.accent, type: envelopes.type,
    allocatedAmount: envelopes.allocatedAmount, sortOrder: envelopes.sortOrder,
    spent: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = 'expense'), 0)`,
    saved: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = 'saving'), 0)`,
    transactionCount: sql<number>`count(${transactions.id})::int`,
  }).from(envelopes).leftJoin(transactions, and(eq(transactions.envelopeId, envelopes.id), eq(transactions.userId, userId)))
    .where(and(eq(envelopes.userId, userId), eq(envelopes.budgetMonthId, id))).groupBy(envelopes.id).orderBy(asc(envelopes.sortOrder));
  const detail = envelopeRows.map((row) => {
    const actual = row.type === "savings" ? row.saved : row.spent;
    return { ...row, spent: moneyString(row.spent), saved: moneyString(row.saved), remaining: money(row.allocatedAmount).minus(actual).toFixed(2), ...envelopeStatus(row.allocatedAmount, actual) };
  });
  const summary = calculateSummary(budget.income, detail.map((item) => item.allocatedAmount), detail.map((item) => item.spent), detail.filter((item) => item.type === "savings").map((item) => item.allocatedAmount));
  return { ...budget, ...summary, allocationUsed: percentage(summary.totalAllocated, summary.income), envelopes: detail };
}
import "server-only";

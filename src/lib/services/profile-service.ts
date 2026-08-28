import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { budgetMonths, envelopes, transactions, userProfiles, userSettings, users } from "@/db/schema";

export async function getProfile(userId: string) {
  const [profile] = await db.select({ id: users.id, email: users.email, displayName: userProfiles.displayName, avatarUrl: userProfiles.avatarUrl, currency: userProfiles.currency, locale: userProfiles.locale, timezone: userProfiles.timezone, createdAt: users.createdAt })
    .from(users).innerJoin(userProfiles, eq(userProfiles.userId, users.id)).where(eq(users.id, userId)).limit(1);
  return profile;
}
export async function updateProfile(userId: string, input: Partial<typeof userProfiles.$inferInsert>) {
  const [profile] = await db.update(userProfiles).set({ ...input, updatedAt: new Date() }).where(eq(userProfiles.userId, userId)).returning();
  return profile;
}
export async function getSettings(userId: string) {
  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return settings;
}
export async function updateSettings(userId: string, theme: string) {
  const [settings] = await db.update(userSettings).set({ theme, updatedAt: new Date() }).where(eq(userSettings.userId, userId)).returning();
  return settings;
}
export async function exportData(userId: string) {
  const [profile, budgets, envelopeRows, transactionRows] = await Promise.all([
    getProfile(userId), db.select().from(budgetMonths).where(eq(budgetMonths.userId, userId)),
    db.select().from(envelopes).where(eq(envelopes.userId, userId)), db.select().from(transactions).where(eq(transactions.userId, userId)),
  ]);
  return { version: "1.0", exportedAt: new Date().toISOString(), profile, budgetMonths: budgets, envelopes: envelopeRows, transactions: transactionRows };
}
export async function deleteAccount(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}

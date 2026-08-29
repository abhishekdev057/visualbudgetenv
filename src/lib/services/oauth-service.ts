import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { oauthAccounts, userProfiles, userSettings, users } from "@/db/schema";
import { AppError } from "@/lib/errors";

export type GoogleIdentity = { subject: string; email: string; displayName: string; avatarUrl: string | null };

export async function findOrCreateGoogleUser(identity: GoogleIdentity) {
  const existing = await db.select({ id: users.id, email: users.email, displayName: userProfiles.displayName }).from(oauthAccounts)
    .innerJoin(users, eq(users.id, oauthAccounts.userId)).innerJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(and(eq(oauthAccounts.provider, "google"), eq(oauthAccounts.providerAccountId, identity.subject))).limit(1);
  if (existing[0]) {
    await db.update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, existing[0].id));
    return existing[0];
  }

  try {
    return await db.transaction(async (tx) => {
      const byEmail = await tx.select({ id: users.id, email: users.email, displayName: userProfiles.displayName }).from(users)
        .innerJoin(userProfiles, eq(userProfiles.userId, users.id)).where(eq(users.email, identity.email)).limit(1);
      const user = byEmail[0] ?? (await tx.insert(users).values({ email: identity.email, emailVerifiedAt: new Date() }).returning({ id: users.id, email: users.email }))[0];
      if (!byEmail[0]) {
        await tx.insert(userProfiles).values({ userId: user.id, displayName: identity.displayName, avatarUrl: identity.avatarUrl });
        await tx.insert(userSettings).values({ userId: user.id });
      } else {
        await tx.update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
      }
      await tx.insert(oauthAccounts).values({ userId: user.id, provider: "google", providerAccountId: identity.subject });
      return byEmail[0] ?? { ...user, displayName: identity.displayName };
    });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("duplicate key")) throw error;
    const linked = await db.select({ id: users.id, email: users.email, displayName: userProfiles.displayName }).from(oauthAccounts)
      .innerJoin(users, eq(users.id, oauthAccounts.userId)).innerJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(and(eq(oauthAccounts.provider, "google"), eq(oauthAccounts.providerAccountId, identity.subject))).limit(1);
    if (linked[0]) return linked[0];
    throw new AppError("GOOGLE_ACCOUNT_LINK_FAILED", "Google account could not be linked. Please try again.", 409);
  }
}

export async function linkGoogleIdentity(userId: string, identity: GoogleIdentity) {
  return db.transaction(async (tx) => {
    const [linkedAccount] = await tx.select({ userId: oauthAccounts.userId }).from(oauthAccounts)
      .where(and(eq(oauthAccounts.provider, "google"), eq(oauthAccounts.providerAccountId, identity.subject))).limit(1);
    if (linkedAccount && linkedAccount.userId !== userId) throw new AppError("GOOGLE_ALREADY_LINKED", "This Google account is already linked to another Li-Khata account.", 409);

    const [user] = await tx.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new AppError("NOT_FOUND", "Your account could not be found.", 404);
    if (user.email && user.email !== identity.email) throw new AppError("GOOGLE_EMAIL_MISMATCH", "Choose the Google account that matches your Li-Khata email, or update your email with support.", 409);

    const [emailOwner] = await tx.select({ id: users.id }).from(users).where(eq(users.email, identity.email)).limit(1);
    if (emailOwner && emailOwner.id !== userId) throw new AppError("EMAIL_ALREADY_LINKED", "This Google email is already linked to another Li-Khata account.", 409);

    await tx.update(users).set({ email: identity.email, emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
    if (!linkedAccount) await tx.insert(oauthAccounts).values({ userId, provider: "google", providerAccountId: identity.subject });
    return { id: userId, email: identity.email };
  });
}

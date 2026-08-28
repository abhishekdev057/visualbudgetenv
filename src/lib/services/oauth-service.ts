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
  if (existing[0]) return existing[0];

  try {
    return await db.transaction(async (tx) => {
      const byEmail = await tx.select({ id: users.id, email: users.email, displayName: userProfiles.displayName }).from(users)
        .innerJoin(userProfiles, eq(userProfiles.userId, users.id)).where(eq(users.email, identity.email)).limit(1);
      const user = byEmail[0] ?? (await tx.insert(users).values({ email: identity.email }).returning({ id: users.id, email: users.email }))[0];
      if (!byEmail[0]) {
        await tx.insert(userProfiles).values({ userId: user.id, displayName: identity.displayName, avatarUrl: identity.avatarUrl });
        await tx.insert(userSettings).values({ userId: user.id });
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

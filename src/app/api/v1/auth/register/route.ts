import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { userProfiles, userSettings, users } from "@/db/schema";
import { apiError, created, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, attachSessionCookie, createSession, hashPassword } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    await assertTrustedOrigin(request);
    const input = registerSchema.parse(await readJson(request));
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
    if (existing) throw new AppError("EMAIL_EXISTS", "An account with this email already exists", 409);
    let user;
    try {
      user = await db.transaction(async (tx) => {
        const [createdUser] = await tx.insert(users).values({ email: input.email, passwordHash: await hashPassword(input.password) }).returning({ id: users.id, email: users.email });
        await tx.insert(userProfiles).values({ userId: createdUser.id, displayName: input.displayName });
        await tx.insert(userSettings).values({ userId: createdUser.id });
        return { ...createdUser, displayName: input.displayName };
      });
    } catch (error) {
      if (error instanceof Error && (error.message.includes("users_email_unique") || error.message.includes("duplicate key"))) throw new AppError("EMAIL_EXISTS", "An account with this email already exists", 409);
      throw error;
    }
    const session = await createSession(user.id, request.headers.get("user-agent"));
    const response = created({ user, ...(input.client === "mobile" ? { accessToken: session.token, expiresAt: session.expiresAt.toISOString() } : {}) });
    if (input.client === "web") attachSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) { return apiError(error); }
}

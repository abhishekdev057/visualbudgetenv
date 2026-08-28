import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, attachSessionCookie, createSession, hashPassword, requireRequestUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
const schema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(10).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/) });
export async function POST(request: NextRequest) {
  try {
    await assertTrustedOrigin(request); const user = await requireRequestUser(request); const input = schema.parse(await readJson(request));
    const [account] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!account || !(await compare(input.currentPassword, account.passwordHash))) throw new AppError("INVALID_PASSWORD", "Current password is incorrect", 422);
    await db.transaction(async (tx) => { await tx.update(users).set({ passwordHash: await hashPassword(input.newPassword), updatedAt: new Date() }).where(eq(users.id, user.id)); await tx.delete(sessions).where(eq(sessions.userId, user.id)); });
    const session = await createSession(user.id, request.headers.get("user-agent")); const response = ok({ changed: true });
    if (request.headers.get("authorization")?.startsWith("Bearer ")) return ok({ changed: true, accessToken: session.token, expiresAt: session.expiresAt.toISOString() });
    attachSessionCookie(response, session.token, session.expiresAt); return response;
  } catch (error) { return apiError(error); }
}

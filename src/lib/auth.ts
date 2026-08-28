import { compare, hash } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions, userProfiles, users } from "@/db/schema";
import { AppError, unauthorized } from "./errors";

export const SESSION_COOKIE = "envelope_session";
const SESSION_DAYS = 30;

const tokenDigest = (token: string) => createHash("sha256").update(token).digest("hex");
export const hashPassword = (password: string) => hash(password, 12);

export async function createSession(userId: string, userAgent?: string | null) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.insert(sessions).values({ userId, tokenHash: tokenDigest(token), expiresAt, userAgent: userAgent?.slice(0, 500) });
  return { token, expiresAt };
}

export function attachSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt,
  });
}

export async function verifyCredentials(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await compare(password, user.passwordHash))) throw new AppError("INVALID_CREDENTIALS", "Email or password is incorrect", 401);
  return user;
}

export async function resolveUser(token?: string | null) {
  if (!token) return null;
  const [row] = await db.select({
    id: users.id, email: users.email, displayName: userProfiles.displayName, avatarUrl: userProfiles.avatarUrl,
    currency: userProfiles.currency, locale: userProfiles.locale, timezone: userProfiles.timezone,
  }).from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenDigest(token)), gt(sessions.expiresAt, new Date()))).limit(1);
  return row ?? null;
}

export async function getRequestUser(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : request.cookies.get(SESSION_COOKIE)?.value;
  return resolveUser(token);
}

export async function requireRequestUser(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) throw unauthorized();
  return user;
}

export async function getCurrentUser() {
  const store = await cookies();
  return resolveUser(store.get(SESSION_COOKIE)?.value);
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

export async function deleteCurrentSession(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : request.cookies.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, tokenDigest(token)));
}

export async function assertTrustedOrigin(request: NextRequest) {
  if (request.headers.get("authorization")?.startsWith("Bearer ")) return;
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host || new URL(origin).host !== host) throw new AppError("INVALID_ORIGIN", "Request origin is not allowed", 403);
}
import "server-only";

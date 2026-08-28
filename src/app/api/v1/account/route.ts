import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser, SESSION_COOKIE } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { deleteAccount } from "@/lib/services/profile-service";
import { accountDeleteSchema } from "@/lib/validation";
export async function DELETE(request: NextRequest) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const input = accountDeleteSchema.parse(await readJson(request)); const [account] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id)).limit(1); if (!account || (account.passwordHash && (!input.password || !(await compare(input.password, account.passwordHash)))) || (!account.passwordHash && input.password)) throw new AppError("INVALID_PASSWORD", "Password is incorrect", 422); await deleteAccount(user.id); const response = ok({ deleted: true }); response.cookies.set(SESSION_COOKIE, "", { expires: new Date(0), path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }); return response; } catch (error) { return apiError(error); } }

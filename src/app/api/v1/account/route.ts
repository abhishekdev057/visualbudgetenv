import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser, SESSION_COOKIE } from "@/lib/auth";
import { deleteAccount } from "@/lib/services/profile-service";
export async function DELETE(request: NextRequest) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); await deleteAccount(user.id); const response = ok({ deleted: true }); response.cookies.set(SESSION_COOKIE, "", { expires: new Date(0), path: "/" }); return response; } catch (error) { return apiError(error); } }

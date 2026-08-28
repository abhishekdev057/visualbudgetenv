import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api-response";
import { assertTrustedOrigin, deleteCurrentSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await assertTrustedOrigin(request);
    await deleteCurrentSession(request);
    const response = ok({ signedOut: true });
    response.cookies.set(SESSION_COOKIE, "", { expires: new Date(0), path: "/", httpOnly: true, sameSite: "lax" });
    return response;
  } catch (error) { return apiError(error); }
}

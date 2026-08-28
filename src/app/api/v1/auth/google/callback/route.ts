import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api-response";
import { attachSessionCookie, createSession } from "@/lib/auth";
import { decodeGoogleState, exchangeGoogleCode, googleRedirectUri, GOOGLE_OAUTH_STATE_COOKIE, safeStateMatch } from "@/lib/google-auth";
import { findOrCreateGoogleUser } from "@/lib/services/oauth-service";
import { AppError } from "@/lib/errors";

function redirectToSignIn(request: NextRequest, reason: string) {
  const url = new URL("/sign-in", request.nextUrl.origin);
  url.searchParams.set("oauth", reason);
  return url;
}

export async function GET(request: NextRequest) {
  const clearState = (response: NextResponse) => { response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/v1/auth/google", maxAge: 0 }); return response; };
  try {
    googleRedirectUri(request);
    if (request.nextUrl.searchParams.has("error")) return clearState(NextResponse.redirect(redirectToSignIn(request, "cancelled")));
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const savedState = decodeGoogleState(request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value);
    if (!code || !savedState || !safeStateMatch(state ?? undefined, savedState.state)) throw new AppError("INVALID_GOOGLE_STATE", "Google sign-in session expired. Please try again.", 401);
    const identity = await exchangeGoogleCode(request, code, savedState.nonce);
    const user = await findOrCreateGoogleUser(identity);
    const session = await createSession(user.id, request.headers.get("user-agent"));
    const response = NextResponse.redirect(new URL("/", request.nextUrl.origin));
    attachSessionCookie(response, session.token, session.expiresAt);
    return clearState(response);
  } catch (error) {
    if (error instanceof AppError) return clearState(NextResponse.redirect(redirectToSignIn(request, "failed")));
    return apiError(error);
  }
}

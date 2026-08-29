import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api-response";
import { attachSessionCookie, createSession } from "@/lib/auth";
import { decodeGoogleState, exchangeGoogleCode, googleRedirectUri, GOOGLE_OAUTH_STATE_COOKIE, safeStateMatch } from "@/lib/google-auth";
import { findOrCreateGoogleUser, linkGoogleIdentity } from "@/lib/services/oauth-service";
import { AppError } from "@/lib/errors";

function redirectToAuth(request: NextRequest, reason: string, intent: "sign-in" | "link" = "sign-in") {
  const url = new URL(intent === "link" ? "/onboarding/verify" : "/sign-in", request.nextUrl.origin);
  url.searchParams.set("oauth", reason);
  return url;
}

export async function GET(request: NextRequest) {
  const clearState = (response: NextResponse) => { response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/v1/auth/google", maxAge: 0 }); return response; };
  let oauthIntent: "sign-in" | "link" = "sign-in";
  try {
    googleRedirectUri(request);
    const savedState = decodeGoogleState(request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value);
    oauthIntent = savedState?.intent ?? "sign-in";
    if (request.nextUrl.searchParams.has("error")) return clearState(NextResponse.redirect(redirectToAuth(request, "cancelled", oauthIntent)));
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    if (!code || !savedState || !safeStateMatch(state ?? undefined, savedState.state)) throw new AppError("INVALID_GOOGLE_STATE", "Google sign-in session expired. Please try again.", 401);
    const identity = await exchangeGoogleCode(request, code, savedState.nonce);
    const user = savedState.intent === "link" ? await linkGoogleIdentity(savedState.userId!, identity) : await findOrCreateGoogleUser(identity);
    const session = await createSession(user.id, request.headers.get("user-agent"));
    const response = NextResponse.redirect(new URL("/onboarding/verify", request.nextUrl.origin));
    attachSessionCookie(response, session.token, session.expiresAt);
    return clearState(response);
  } catch (error) {
    if (error instanceof AppError) return clearState(NextResponse.redirect(redirectToAuth(request, "failed", oauthIntent)));
    return apiError(error);
  }
}

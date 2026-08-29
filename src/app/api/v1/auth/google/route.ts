import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api-response";
import { getRequestUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { createGoogleState, encodeGoogleState, googleAuthorizationUrl, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  try {
    const intent = request.nextUrl.searchParams.get("intent") === "link" ? "link" : "sign-in";
    const currentUser = intent === "link" ? await getRequestUser(request) : null;
    if (intent === "link" && !currentUser) throw new AppError("UNAUTHORIZED", "Sign in before linking Google.", 401);
    const state = createGoogleState(intent, currentUser?.id);
    const response = NextResponse.redirect(googleAuthorizationUrl(request, state));
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, encodeGoogleState(state), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/v1/auth/google", maxAge: 10 * 60 });
    return response;
  } catch (error) { return apiError(error); }
}

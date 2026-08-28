import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api-response";
import { createGoogleState, encodeGoogleState, googleAuthorizationUrl, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  try {
    const state = createGoogleState();
    const response = NextResponse.redirect(googleAuthorizationUrl(request, state));
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, encodeGoogleState(state), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/v1/auth/google", maxAge: 10 * 60 });
    return response;
  } catch (error) { return apiError(error); }
}

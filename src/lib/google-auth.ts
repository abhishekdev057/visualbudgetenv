import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";
import { AppError } from "@/lib/errors";
import type { GoogleIdentity } from "@/lib/services/oauth-service";

export const GOOGLE_OAUTH_STATE_COOKIE = "envelope_google_oauth";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

function requireGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new AppError("GOOGLE_AUTH_UNAVAILABLE", "Google sign-in is not configured", 503);
  return { clientId, clientSecret };
}

export function googleRedirectUri(request: NextRequest) {
  const configured = process.env.APP_URL;
  if (!configured && process.env.NODE_ENV === "production") throw new AppError("GOOGLE_AUTH_UNAVAILABLE", "APP_URL is required for Google sign-in in production", 503);
  return new URL("/api/v1/auth/google/callback", configured ?? request.nextUrl.origin).toString();
}

export function createGoogleState() { return { state: randomBytes(32).toString("base64url"), nonce: randomBytes(32).toString("base64url") }; }
export function encodeGoogleState(value: { state: string; nonce: string }) { return `${value.state}.${value.nonce}`; }
export function decodeGoogleState(value?: string) {
  const [state, nonce, ...extra] = value?.split(".") ?? [];
  return state && nonce && extra.length === 0 ? { state, nonce } : null;
}
export function safeStateMatch(left?: string, right?: string) {
  if (!left || !right || left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export function googleAuthorizationUrl(request: NextRequest, state: { state: string; nonce: string }) {
  const { clientId } = requireGoogleConfig();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", googleRedirectUri(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state.state);
  url.searchParams.set("nonce", state.nonce);
  url.searchParams.set("prompt", "select_account");
  return url;
}

export async function exchangeGoogleCode(request: NextRequest, code: string, nonce: string) {
  const { clientId, clientSecret } = requireGoogleConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", cache: "no-store", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: googleRedirectUri(request), grant_type: "authorization_code" }) });
  if (!response.ok) throw new AppError("GOOGLE_AUTH_FAILED", "Google sign-in could not be completed", 401);
  const payload = await response.json() as { id_token?: unknown };
  if (typeof payload.id_token !== "string") throw new AppError("GOOGLE_AUTH_FAILED", "Google did not return an identity token", 401);
  return verifyGoogleIdToken(payload.id_token, nonce);
}

export async function verifyGoogleIdToken(idToken: string, expectedNonce?: string): Promise<GoogleIdentity> {
  const { clientId } = requireGoogleConfig();
  let payload: JWTPayload;
  try { ({ payload } = await jwtVerify(idToken, googleJwks, { audience: clientId, issuer: GOOGLE_ISSUERS })); }
  catch { throw new AppError("INVALID_GOOGLE_TOKEN", "Google identity token is invalid or expired", 401); }
  if (expectedNonce && payload.nonce !== expectedNonce) throw new AppError("INVALID_GOOGLE_TOKEN", "Google sign-in verification failed", 401);
  if (typeof payload.sub !== "string" || typeof payload.email !== "string" || (payload.email_verified !== true && payload.email_verified !== "true")) throw new AppError("INVALID_GOOGLE_TOKEN", "Google did not provide a verified email address", 401);
  return { subject: payload.sub, email: payload.email.toLowerCase(), displayName: typeof payload.name === "string" && payload.name.trim() ? payload.name.trim().slice(0, 80) : payload.email.split("@")[0], avatarUrl: typeof payload.picture === "string" ? payload.picture : null };
}

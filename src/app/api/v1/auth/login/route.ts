import type { NextRequest } from "next/server";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, attachSessionCookie, createSession, verifyCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    await assertTrustedOrigin(request);
    const input = loginSchema.parse(await readJson(request));
    const user = await verifyCredentials(input.email, input.password);
    const session = await createSession(user.id, request.headers.get("user-agent"));
    const response = ok({ user: { id: user.id, email: user.email }, ...(input.client === "mobile" ? { accessToken: session.token, expiresAt: session.expiresAt.toISOString() } : {}) });
    if (input.client === "web") attachSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) { return apiError(error); }
}

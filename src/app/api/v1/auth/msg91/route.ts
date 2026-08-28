import type { NextRequest } from "next/server";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, attachSessionCookie, createSession } from "@/lib/auth";
import { findOrCreatePhoneUser, verifyMsg91AccessToken } from "@/lib/services/phone-auth-service";
import { msg91LoginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    await assertTrustedOrigin(request);
    const input = msg91LoginSchema.parse(await readJson(request));
    const phone = await verifyMsg91AccessToken(input.accessToken);
    const user = await findOrCreatePhoneUser(phone);
    const session = await createSession(user.id, request.headers.get("user-agent"));
    const response = ok({ user, ...(input.client === "mobile" ? { accessToken: session.token, expiresAt: session.expiresAt.toISOString() } : {}) });
    if (input.client === "web") attachSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) { return apiError(error); }
}

import type { NextRequest } from "next/server";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, attachSessionCookie, createSession, getRequestUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { findOrCreatePhoneUser, linkPhoneToUser, verifyMsg91AccessToken } from "@/lib/services/phone-auth-service";
import { msg91LoginSchema } from "@/lib/validation";

export async function GET() {
  const widgetId = process.env.MSG91_WIDGET_ID;
  const tokenAuth = process.env.MSG91_WIDGET_TOKEN;
  if (!widgetId || !tokenAuth) return apiError(new AppError("MSG91_NOT_CONFIGURED", "Mobile sign-in is not configured yet.", 503));
  const response = ok({ widgetId, tokenAuth });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function POST(request: NextRequest) {
  try {
    await assertTrustedOrigin(request);
    const input = msg91LoginSchema.parse(await readJson(request));
    const phone = await verifyMsg91AccessToken(input.accessToken);
    const currentUser = await getRequestUser(request);
    const user = currentUser ? await linkPhoneToUser(currentUser.id, phone) : await findOrCreatePhoneUser(phone);
    const session = await createSession(user.id, request.headers.get("user-agent"));
    const response = ok({ user, ...(input.client === "mobile" ? { accessToken: session.token, expiresAt: session.expiresAt.toISOString() } : {}) });
    if (input.client === "web") attachSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) { return apiError(error); }
}

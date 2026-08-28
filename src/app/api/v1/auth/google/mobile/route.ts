import type { NextRequest } from "next/server";
import { apiError, ok, readJson } from "@/lib/api-response";
import { createSession } from "@/lib/auth";
import { verifyGoogleIdToken } from "@/lib/google-auth";
import { findOrCreateGoogleUser } from "@/lib/services/oauth-service";
import { z } from "zod";

const schema = z.object({ idToken: z.string().min(100).max(10000) });

export async function POST(request: NextRequest) {
  try {
    const { idToken } = schema.parse(await readJson(request));
    const identity = await verifyGoogleIdToken(idToken);
    const user = await findOrCreateGoogleUser(identity);
    const session = await createSession(user.id, request.headers.get("user-agent"));
    return ok({ user, accessToken: session.token, expiresAt: session.expiresAt.toISOString() });
  } catch (error) { return apiError(error); }
}

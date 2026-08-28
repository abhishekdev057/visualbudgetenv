import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userProfiles, userSettings, users } from "@/db/schema";
import { AppError } from "@/lib/errors";

type Msg91Payload = Record<string, unknown>;
const phonePattern = /^\d{8,15}$/;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function extractVerifiedPhone(payload: Msg91Payload) {
  const candidates = [
    payload.mobile, payload.phone, payload.identifier,
    (payload.data as Msg91Payload | undefined)?.mobile,
    (payload.data as Msg91Payload | undefined)?.phone,
    (payload.data as Msg91Payload | undefined)?.identifier,
  ];
  for (const candidate of candidates) {
    const phone = readString(candidate).replace(/^\+/, "").replace(/\s|-/g, "");
    if (phonePattern.test(phone)) return phone;
  }
  throw new AppError("MSG91_IDENTITY_INVALID", "Your mobile number could not be confirmed. Please request a new OTP.", 401);
}

export async function verifyMsg91AccessToken(accessToken: string) {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) throw new AppError("MSG91_NOT_CONFIGURED", "Mobile sign-in is not configured yet.", 503);
  let response: Response;
  try {
    response = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
      method: "POST", cache: "no-store", headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ authkey: authKey, "access-token": accessToken }), signal: AbortSignal.timeout(10_000),
    });
  } catch { throw new AppError("MSG91_UNAVAILABLE", "Mobile verification is temporarily unavailable. Please try again.", 503); }
  const payload = await response.json().catch(() => null) as Msg91Payload | null;
  if (!response.ok || !payload) throw new AppError("MSG91_TOKEN_INVALID", "This OTP verification has expired. Please request a new one.", 401);
  return extractVerifiedPhone(payload);
}

export async function findOrCreatePhoneUser(phone: string) {
  const [existing] = await db.select({ id: users.id, email: users.email, phone: users.phone, displayName: userProfiles.displayName }).from(users)
    .innerJoin(userProfiles, eq(userProfiles.userId, users.id)).where(eq(users.phone, phone)).limit(1);
  if (existing) return existing;
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({ phone, phoneVerifiedAt: new Date() }).returning({ id: users.id, email: users.email, phone: users.phone });
      const displayName = "Li-Khata member";
      await tx.insert(userProfiles).values({ userId: user.id, displayName });
      await tx.insert(userSettings).values({ userId: user.id });
      return { ...user, displayName };
    });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("duplicate key")) throw error;
    const [linked] = await db.select({ id: users.id, email: users.email, phone: users.phone, displayName: userProfiles.displayName }).from(users)
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id)).where(eq(users.phone, phone)).limit(1);
    if (linked) return linked;
    throw new AppError("MSG91_ACCOUNT_LINK_FAILED", "Your verified mobile number could not be linked. Please try again.", 409);
  }
}

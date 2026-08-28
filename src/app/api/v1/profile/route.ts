import type { NextRequest } from "next/server";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/services/profile-service";
import { profileUpdateSchema } from "@/lib/validation";
export async function GET(request: NextRequest) { try { const user = await requireRequestUser(request); return ok(await getProfile(user.id)); } catch (error) { return apiError(error); } }
export async function PATCH(request: NextRequest) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); return ok(await updateProfile(user.id, profileUpdateSchema.parse(await readJson(request)))); } catch (error) { return apiError(error); } }

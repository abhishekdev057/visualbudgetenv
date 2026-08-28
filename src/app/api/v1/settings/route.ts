import type { NextRequest } from "next/server";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/services/profile-service";
import { settingsUpdateSchema } from "@/lib/validation";
export async function GET(request: NextRequest) { try { const user = await requireRequestUser(request); return ok(await getSettings(user.id)); } catch (error) { return apiError(error); } }
export async function PATCH(request: NextRequest) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const input = settingsUpdateSchema.parse(await readJson(request)); return ok(await updateSettings(user.id, input.theme)); } catch (error) { return apiError(error); } }

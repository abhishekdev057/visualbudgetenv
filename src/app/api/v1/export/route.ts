import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api-response";
import { requireRequestUser } from "@/lib/auth";
import { exportData } from "@/lib/services/profile-service";
export async function GET(request: NextRequest) { try { const user = await requireRequestUser(request); const response = ok(await exportData(user.id)); response.headers.set("Content-Disposition", `attachment; filename="envelope-export-${new Date().toISOString().slice(0, 10)}.json"`); return response; } catch (error) { return apiError(error); } }

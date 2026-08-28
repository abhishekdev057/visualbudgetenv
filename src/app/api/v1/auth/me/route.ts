import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api-response";
import { requireRequestUser } from "@/lib/auth";
export async function GET(request: NextRequest) {
  try { return ok(await requireRequestUser(request)); } catch (error) { return apiError(error); }
}

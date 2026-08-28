import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api-response";
import { requireRequestUser } from "@/lib/auth";
import { getInsights } from "@/lib/services/insight-service";
import { uuid } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Context) { try { const user = await requireRequestUser(request); const { id } = await params; return ok(await getInsights(user.id, uuid.parse(id))); } catch (error) { return apiError(error); } }

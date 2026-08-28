import type { NextRequest } from "next/server";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { deleteEnvelope, findEnvelope, updateEnvelope } from "@/lib/services/envelope-service";
import { envelopeInputSchema, uuid } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Context) { try { const user = await requireRequestUser(request); const { id } = await params; return ok(await findEnvelope(user.id, uuid.parse(id))); } catch (error) { return apiError(error); } }
export async function PATCH(request: NextRequest, { params }: Context) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const { id } = await params; return ok(await updateEnvelope(user.id, uuid.parse(id), envelopeInputSchema.partial().parse(await readJson(request)))); } catch (error) { return apiError(error); } }
export async function DELETE(request: NextRequest, { params }: Context) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const { id } = await params; const moveTo = request.nextUrl.searchParams.get("moveTo") ?? undefined; await deleteEnvelope(user.id, uuid.parse(id), moveTo ? uuid.parse(moveTo) : undefined); return ok({ deleted: true }); } catch (error) { return apiError(error); } }

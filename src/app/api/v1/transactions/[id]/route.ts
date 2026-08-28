import type { NextRequest } from "next/server";
import { apiError, ok, readJson } from "@/lib/api-response";
import { assertTrustedOrigin, requireRequestUser } from "@/lib/auth";
import { deleteTransaction, findTransaction, updateTransaction } from "@/lib/services/transaction-service";
import { transactionUpdateSchema, uuid } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Context) { try { const user = await requireRequestUser(request); const { id } = await params; return ok(await findTransaction(user.id, uuid.parse(id))); } catch (error) { return apiError(error); } }
export async function PATCH(request: NextRequest, { params }: Context) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const { id } = await params; return ok(await updateTransaction(user.id, uuid.parse(id), transactionUpdateSchema.parse(await readJson(request)))); } catch (error) { return apiError(error); } }
export async function DELETE(request: NextRequest, { params }: Context) { try { await assertTrustedOrigin(request); const user = await requireRequestUser(request); const { id } = await params; await deleteTransaction(user.id, uuid.parse(id)); return ok({ deleted: true }); } catch (error) { return apiError(error); } }

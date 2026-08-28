import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function apiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Please check the submitted values", details: error.flatten() } }, { status: 422 });
  if (error instanceof AppError) return NextResponse.json({ success: false, error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } }, { status: error.status });
  if (process.env.NODE_ENV !== "test") console.error("Request failed", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
}

export async function readJson(request: Request) {
  try { return await request.json(); } catch { throw new AppError("INVALID_JSON", "Request body must be valid JSON", 400); }
}

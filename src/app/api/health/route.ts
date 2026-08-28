import { sql } from "drizzle-orm";
import { db } from "@/db";
import { apiError, ok } from "@/lib/api-response";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return ok({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) { return apiError(error); }
}

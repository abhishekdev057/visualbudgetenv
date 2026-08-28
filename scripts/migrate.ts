import { Pool } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required");
const migration = await readFile(resolve("src/db/migrations/0000_envelope_foundation.sql"), "utf8");
const pool = new Pool({ connectionString: url });
try {
  await pool.query(migration);
  console.log("Database migration completed.");
} finally {
  await pool.end();
}

import { Pool } from "@neondatabase/serverless";
import { loadEnvConfig } from "@next/env";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  loadEnvConfig(process.cwd());
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required");
  const migrationDirectory = resolve("src/db/migrations");
  const migrationFiles = (await readdir(migrationDirectory)).filter((file) => file.endsWith(".sql")).sort();
  const pool = new Pool({ connectionString: url });
  try {
    for (const file of migrationFiles) await pool.query(await readFile(resolve(migrationDirectory, file), "utf8"));
    console.log("Database migration completed.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Database migration failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});

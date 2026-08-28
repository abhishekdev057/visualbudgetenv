import "server-only";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

function createDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return drizzle(new Pool({ connectionString: url }), { schema });
}

export type Database = ReturnType<typeof createDatabase>;
let instance: Database | undefined;
export const db = new Proxy({} as Database, {
  get(_target, property) {
    instance ??= createDatabase();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString =
  process.env.NEON_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "Set NEON_DATABASE_URL (or DATABASE_URL) to a PostgreSQL connection string.",
  );
}

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10_000,
  max: 5,
});
export const db = drizzle(pool, { schema });

export * from "./schema";

import { defineConfig } from "drizzle-kit";
import path from "path";

const connectionString =
  process.env.NEON_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("Set NEON_DATABASE_URL (or DATABASE_URL) before running Drizzle.");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});

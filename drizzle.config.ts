import { defineConfig } from "drizzle-kit";

/**
 * `dbCredentials` is only needed by `push`, `studio` and `migrate`. It is left
 * empty when `DATABASE_URL` is absent so `pnpm db:generate` still produces SQL
 * without a live database.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  strict: true,
  verbose: true,
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});

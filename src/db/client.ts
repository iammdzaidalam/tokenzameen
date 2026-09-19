import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

type Memo = {
  url: string;
  sql: postgres.Sql;
  db: Database;
};

/**
 * A Fluid Compute instance serves many invocations, so the pool is cached on
 * `globalThis` and reused. It is never created at module scope: importing this
 * file must stay free of side effects for builds and renders that run without
 * `DATABASE_URL`.
 */
const store = globalThis as typeof globalThis & { __tokenzameenDb?: Memo };

export function getDb(): Database | null {
  const url = env.DATABASE_URL;
  if (!url) return null;

  const memo = store.__tokenzameenDb;
  if (memo && memo.url === url) return memo.db;

  try {
    const sql = postgres(url, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
    const db = drizzle(sql, { schema });
    store.__tokenzameenDb = { url, sql, db };
    return db;
  } catch (error) {
    console.error("[db] failed to create the Postgres client", error);
    return null;
  }
}

/** For scripts. Long-running server instances keep the pool for reuse. */
export async function closeDb(): Promise<void> {
  const memo = store.__tokenzameenDb;
  if (!memo) return;
  store.__tokenzameenDb = undefined;
  await memo.sql.end({ timeout: 5 });
}

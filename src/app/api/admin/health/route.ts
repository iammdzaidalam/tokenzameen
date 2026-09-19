import { getTableName, is, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { getDb } from "@/db/client";
import journal from "@/db/migrations/meta/_journal.json";
import * as schema from "@/db/schema";
import { json } from "@/app/api/_lib/http";
import { adminConfigStatus, getSession } from "@/lib/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

interface DatabaseHealth {
  reachable: boolean;
  tables: Record<string, boolean>;
  missingTables: string[];
  migrations: {
    /** Tags listed in src/db/migrations/meta/_journal.json. */
    expected: string[];
    /** Rows in drizzle.__drizzle_migrations, or null when `db:push` was used and no journal table exists. */
    applied: number | null;
  };
}

function expectedTables(): string[] {
  const exports: unknown[] = Object.values(schema);
  return exports
    .filter((value): value is PgTable => is(value, PgTable))
    .map((table) => getTableName(table))
    .sort();
}

async function inspectDatabase(): Promise<DatabaseHealth | null> {
  const db = getDb();
  if (!db) return null;
  const expected = expectedTables();
  const migrations = { expected: journal.entries.map((entry) => entry.tag), applied: null as number | null };

  try {
    const rows = await db.execute(
      sql`select table_name from information_schema.tables where table_schema = 'public'`,
    );
    const present = new Set<string>();
    for (const row of rows) {
      const name = (row as Record<string, unknown>).table_name;
      if (typeof name === "string") present.add(name);
    }
    const tables = Object.fromEntries(expected.map((name) => [name, present.has(name)]));

    try {
      const applied = await db.execute(sql`select count(*)::int as count from drizzle.__drizzle_migrations`);
      const first = applied[0] as Record<string, unknown> | undefined;
      if (typeof first?.count === "number") migrations.applied = first.count;
    } catch {
      migrations.applied = null;
    }

    return {
      reachable: true,
      tables,
      missingTables: expected.filter((name) => !present.has(name)),
      migrations,
    };
  } catch (error) {
    console.error("[admin] health check could not reach the database", error);
    return {
      reachable: false,
      tables: Object.fromEntries(expected.map((name) => [name, false])),
      missingTables: expected,
      migrations,
    };
  }
}

export async function GET(): Promise<Response> {
  try {
    if (!(await getSession())) {
      return json({ ok: false, error: "unauthorized", message: "Sign in to the admin panel first." }, 401);
    }
    const database = env.hasDatabase ? await inspectDatabase() : null;
    return json({
      ok: true,
      checkedAt: new Date().toISOString(),
      hasDatabase: env.hasDatabase,
      adminConfigured: adminConfigStatus().configured,
      database,
    });
  } catch (error) {
    console.error("[admin] GET /api/admin/health threw", error);
    return json({ ok: false, error: "unknown", message: "The health check failed." }, 500);
  }
}

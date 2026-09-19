import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
  LEAD_HASH_SALT: z.string().min(8).optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  AI_GATEWAY_API_KEY: z.string().min(1).optional(),
  AI_ADVISOR_MODEL: z.string().min(1).optional(),
});

type Parsed = z.infer<typeof schema>;

let cached: Parsed | null = null;

/**
 * Parsing must never throw. This module is reachable from route handlers that
 * are traced during `next build`, where the database is legitimately
 * unconfigured. An invalid value degrades to `undefined` and the caller decides
 * what that means; it does not take the build or a page render down with it.
 */
function values(): Parsed {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (result.success) {
    cached = result.data;
  } else {
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") console.error(`[env] ignoring ${key}: ${issue.message}`);
    }
    cached = {};
  }
  return cached;
}

export const env = {
  get DATABASE_URL(): string | undefined {
    return values().DATABASE_URL;
  },
  get DATABASE_URL_UNPOOLED(): string | undefined {
    return values().DATABASE_URL_UNPOOLED;
  },
  get LEAD_HASH_SALT(): string | undefined {
    return values().LEAD_HASH_SALT;
  },
  get RATE_LIMIT_WINDOW_MS(): number {
    return values().RATE_LIMIT_WINDOW_MS ?? 60_000;
  },
  get RATE_LIMIT_MAX(): number {
    return values().RATE_LIMIT_MAX ?? 8;
  },
  get ADMIN_EMAIL(): string | undefined {
    return values().ADMIN_EMAIL;
  },
  get ADMIN_PASSWORD_HASH(): string | undefined {
    return values().ADMIN_PASSWORD_HASH;
  },
  get SESSION_SECRET(): string | undefined {
    return values().SESSION_SECRET;
  },
  get AI_GATEWAY_API_KEY(): string | undefined {
    return values().AI_GATEWAY_API_KEY;
  },
  get AI_ADVISOR_MODEL(): string | undefined {
    return values().AI_ADVISOR_MODEL;
  },
  /** False until the Postgres instance is provisioned. See docs/DATA.md. */
  get hasDatabase(): boolean {
    return typeof values().DATABASE_URL === "string";
  },
};

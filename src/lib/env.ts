import { z } from "zod";

/**
 * Keys are parsed one at a time. A single malformed value must never take the
 * rest of the environment with it: an invalid SESSION_SECRET silently disabling
 * DATABASE_URL would turn every lead submission into a 503 while the admin
 * panel still logged in, which is close to undiagnosable in production.
 */
const shape = {
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_UNPOOLED: z.string().min(1),
  LEAD_HASH_SALT: z.string().min(8),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive(),
};

type Shape = typeof shape;
type Parsed = { -readonly [K in keyof Shape]?: z.infer<Shape[K]> };

let cached: Parsed | null = null;

function values(): Parsed {
  if (cached) return cached;
  const parsed: Parsed = {};
  for (const key of Object.keys(shape) as Array<keyof Shape>) {
    const raw = process.env[key];
    if (typeof raw !== "string" || raw.trim() === "") continue;
    const result = shape[key].safeParse(raw.trim());
    if (result.success) {
      parsed[key] = result.data as never;
    } else {
      console.error(`[env] ignoring ${key}: ${result.error.issues[0]?.message ?? "invalid value"}`);
    }
  }
  cached = parsed;
  return cached;
}

function isBlank(value: string | undefined): boolean {
  return typeof value !== "string" || value.trim() === "";
}

if (typeof window === "undefined" && process.env.VERCEL_ENV === "production") {
  const missing = (
    [
      "NEXT_PUBLIC_ADVISOR_PHONE",
      "NEXT_PUBLIC_ADVISOR_WHATSAPP",
      "NEXT_PUBLIC_ADVISOR_EMAIL",
    ] as const
  ).filter((key) => isBlank(process.env[key]));
  if (missing.length > 0) {
    console.error(
      `[config] advisor contact details are unset (${missing.join(", ")}). ` +
        `A buyer whose enquiry fails to record has no way to reach an advisor.`,
    );
  }
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
  /** False until the Postgres instance is provisioned. See docs/DATA.md. */
  get hasDatabase(): boolean {
    return typeof values().DATABASE_URL === "string";
  },
};

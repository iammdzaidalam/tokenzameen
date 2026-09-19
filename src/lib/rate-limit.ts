import { createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

interface Window {
  count: number;
  resetAt: number;
}

/**
 * Per-instance only. Every Fluid Compute instance keeps its own counters, so the
 * effective ceiling is `max × instances`. This is deliberate: it costs nothing,
 * survives a missing database, and stops the obvious floods. A shared store is
 * the production upgrade — see docs/DATA.md.
 */
const store = globalThis as typeof globalThis & {
  __tokenzameenRateLimit?: Map<string, Window>;
  __tokenzameenHashSalt?: string;
};

const MAX_TRACKED_KEYS = 5_000;

function windows(): Map<string, Window> {
  store.__tokenzameenRateLimit ??= new Map();
  return store.__tokenzameenRateLimit;
}

function prune(now: number) {
  const map = windows();
  for (const [key, window] of map) {
    if (window.resetAt <= now) map.delete(key);
  }
  if (map.size > MAX_TRACKED_KEYS) {
    const overflow = map.size - MAX_TRACKED_KEYS;
    let removed = 0;
    for (const key of map.keys()) {
      map.delete(key);
      if (++removed >= overflow) break;
    }
  }
}

export function rateLimit(
  key: string,
  options?: { windowMs?: number; max?: number },
): RateLimitResult {
  const windowMs = options?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const max = options?.max ?? env.RATE_LIMIT_MAX;
  const now = Date.now();
  const map = windows();

  prune(now);

  const existing = map.get(key);
  const window: Window =
    existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + windowMs };

  window.count += 1;
  map.set(key, window);

  const remaining = Math.max(0, max - window.count);
  return {
    ok: window.count <= max,
    limit: max,
    remaining,
    resetAt: window.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((window.resetAt - now) / 1000)),
  };
}

export function resetRateLimit(key?: string): void {
  if (key) windows().delete(key);
  else windows().clear();
}

function salt(): string {
  const configured = env.LEAD_HASH_SALT;
  if (configured) return configured;
  if (!store.__tokenzameenHashSalt) {
    store.__tokenzameenHashSalt = randomBytes(16).toString("hex");
    console.error(
      "[rate-limit] LEAD_HASH_SALT is not set; using a per-instance random salt. " +
        "Stored IP hashes will not correlate across instances until it is configured.",
    );
  }
  return store.__tokenzameenHashSalt;
}

/** A salted digest. Raw IP addresses are never stored or logged. */
export function hashIp(ip: string | null | undefined): string {
  return createHash("sha256")
    .update(`${salt()}:${ip ?? "unknown"}`)
    .digest("hex");
}

export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? headers.get("x-vercel-forwarded-for") ?? null;
}

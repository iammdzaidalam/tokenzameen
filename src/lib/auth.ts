import {
  createHash,
  createHmac,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { clientIp, hashIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

const scrypt = promisify<string, string, number, Buffer>(scryptCallback);

export const SESSION_COOKIE = "tz_admin_session";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const SESSION_REFRESH_AFTER_MS = 30 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const MIN_SECRET_LENGTH = 32;
const SCRYPT_KEY_LENGTH = 64;
const HASH_PREFIX = "scrypt";

export const ADMIN_ENV_KEYS = ["ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "SESSION_SECRET"] as const;
export type AdminEnvKey = (typeof ADMIN_ENV_KEYS)[number];

interface AdminEnv {
  email: string | undefined;
  passwordHash: string | undefined;
  secret: string | undefined;
}

const store = globalThis as typeof globalThis & { __tokenzameenAdminEnvWarned?: Set<string> };

function warnOnce(key: string, message: string) {
  store.__tokenzameenAdminEnvWarned ??= new Set();
  if (store.__tokenzameenAdminEnvWarned.has(key)) return;
  store.__tokenzameenAdminEnvWarned.add(key);
  console.error(`[auth] ignoring ${key}: ${message}`);
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * `src/lib/env.ts` does not know these keys yet. They are read here with the
 * same discipline: lazily, never throwing, and an invalid value degrades to
 * `undefined` so the login page can explain the gap instead of crashing.
 */
function adminEnv(): AdminEnv {
  const email = nonEmpty(process.env.ADMIN_EMAIL);
  let passwordHash = nonEmpty(process.env.ADMIN_PASSWORD_HASH);
  let secret = nonEmpty(process.env.SESSION_SECRET);

  if (passwordHash && !parsePasswordHash(passwordHash)) {
    warnOnce("ADMIN_PASSWORD_HASH", "not a scrypt hash in the documented format");
    passwordHash = undefined;
  }
  if (secret && secret.length < MIN_SECRET_LENGTH) {
    warnOnce("SESSION_SECRET", `must be at least ${MIN_SECRET_LENGTH} characters`);
    secret = undefined;
  }
  return { email, passwordHash, secret };
}

export interface AdminConfigStatus {
  configured: boolean;
  missing: AdminEnvKey[];
}

export function adminConfigStatus(): AdminConfigStatus {
  const values = adminEnv();
  const missing: AdminEnvKey[] = [];
  if (!values.email) missing.push("ADMIN_EMAIL");
  if (!values.passwordHash) missing.push("ADMIN_PASSWORD_HASH");
  if (!values.secret) missing.push("SESSION_SECRET");
  return { configured: missing.length === 0, missing };
}

interface ParsedHash {
  salt: string;
  key: Buffer;
}

function parsePasswordHash(value: string): ParsedHash | null {
  const [prefix, salt, keyHex, ...rest] = value.split("$");
  if (prefix !== HASH_PREFIX || rest.length > 0) return null;
  if (!salt || !/^[0-9a-f]{16,}$/i.test(salt)) return null;
  if (!keyHex || !/^[0-9a-f]+$/i.test(keyHex)) return null;
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== SCRYPT_KEY_LENGTH) return null;
  return { salt, key };
}

const DUMMY_SALT = "0123456789abcdef0123456789abcdef";

/** Always derives a key, so a malformed or missing hash costs the same time as a wrong password. */
async function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  const parsed = stored ? parsePasswordHash(stored) : null;
  let derived: Buffer;
  try {
    derived = await scrypt(password, parsed?.salt ?? DUMMY_SALT, SCRYPT_KEY_LENGTH);
  } catch (error) {
    console.error("[auth] scrypt failed", error);
    return false;
  }
  if (!parsed) return false;
  return derived.length === parsed.key.length && timingSafeEqual(derived, parsed.key);
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function equalStrings(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}

async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const values = adminEnv();
  const emailMatches = values.email
    ? equalStrings(email.trim().toLowerCase(), values.email.toLowerCase())
    : false;
  const passwordMatches = await verifyPassword(password, values.passwordHash);
  return emailMatches && passwordMatches && Boolean(values.secret);
}

export interface SessionPayload {
  v: 1;
  sub: "admin";
  iat: number;
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(encodedPayload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(encodedPayload).digest();
}

export function createSessionToken(now: number = Date.now()): string | null {
  const { secret } = adminEnv();
  if (!secret) return null;
  const payload: SessionPayload = { v: 1, sub: "admin", iat: now, exp: now + SESSION_TTL_MS };
  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${base64url(sign(encoded, secret))}`;
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record.v === 1 &&
    record.sub === "admin" &&
    typeof record.iat === "number" &&
    typeof record.exp === "number" &&
    Number.isFinite(record.iat) &&
    Number.isFinite(record.exp)
  );
}

/**
 * Signature and expiry only. Safe to call from the proxy on every request: no
 * database, no I/O, and a bad token is simply `null`.
 */
export function verifySessionToken(
  token: string | null | undefined,
  now: number = Date.now(),
): SessionPayload | null {
  if (!token) return null;
  const { secret } = adminEnv();
  if (!secret) return null;

  const [encoded, signature, ...rest] = token.split(".");
  if (!encoded || !signature || rest.length > 0) return null;

  const expected = sign(encoded, secret);
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!isSessionPayload(parsed)) return null;
  if (parsed.exp <= now || parsed.iat > now + 60_000) return null;
  return parsed;
}

export function sessionNeedsRefresh(session: SessionPayload, now: number = Date.now()): boolean {
  return now - session.iat >= SESSION_REFRESH_AFTER_MS;
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

async function setSessionCookie(): Promise<boolean> {
  const token = createSessionToken();
  if (!token) return false;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions(new Date(Date.now() + SESSION_TTL_MS)));
  return true;
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "rate-limited" | "invalid"; retryAfterSeconds?: number };

async function loginLimiterKey(): Promise<string> {
  const requestHeaders = await headers();
  return `admin-login:${hashIp(clientIp(requestHeaders))}`;
}

export async function attemptLogin(email: string, password: string): Promise<LoginResult> {
  if (!adminConfigStatus().configured) return { ok: false, reason: "not-configured" };

  const key = await loginLimiterKey();
  const limit = rateLimit(key, { max: LOGIN_MAX_ATTEMPTS, windowMs: LOGIN_WINDOW_MS });
  if (!limit.ok) {
    return { ok: false, reason: "rate-limited", retryAfterSeconds: limit.retryAfterSeconds };
  }

  const valid = await verifyCredentials(email, password);
  if (!valid) return { ok: false, reason: "invalid" };

  const started = await setSessionCookie();
  if (!started) return { ok: false, reason: "not-configured" };

  resetRateLimit(key);
  return { ok: true };
}

/** Only paths inside the panel are honoured, so the login form cannot be used as an open redirect. */
export function safeAdminPath(next: string | null | undefined): string {
  if (!next) return "/admin";
  if (!next.startsWith("/admin") || next.startsWith("//") || next.includes("\\")) return "/admin";
  if (next === "/admin/login" || next.startsWith("/admin/login?")) return "/admin";
  return next;
}

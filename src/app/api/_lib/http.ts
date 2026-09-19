import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import type { ApiErrorCode, ApiFailure } from "@/lib/validation";

const NO_STORE = "no-store, no-cache, must-revalidate";

export function json(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": NO_STORE, ...headers },
  });
}

const STATUS_FOR: Record<ApiErrorCode, number> = {
  invalid: 400,
  rejected: 422,
  "rate-limited": 429,
  unavailable: 503,
  "not-found": 404,
  unknown: 500,
};

export function failure(
  error: ApiErrorCode,
  message: string,
  extra?: { fields?: Record<string, string>; retryAfterSeconds?: number; status?: number },
): Response {
  const body: ApiFailure = {
    ok: false,
    error,
    message,
    ...(extra?.fields ? { fields: extra.fields } : {}),
    ...(extra?.retryAfterSeconds ? { retryAfterSeconds: extra.retryAfterSeconds } : {}),
  };
  const headers = extra?.retryAfterSeconds
    ? { "Retry-After": String(extra.retryAfterSeconds) }
    : undefined;
  return json(body, extra?.status ?? STATUS_FOR[error], headers);
}

export async function readJsonBody(request: Request): Promise<{ ok: true; data: unknown } | { ok: false }> {
  try {
    const data: unknown = await request.json();
    if (typeof data !== "object" || data === null) return { ok: false };
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

export interface RequestIdentity {
  ipHash: string;
  userAgent: string | null;
}

export function identify(request: Request): RequestIdentity {
  return {
    ipHash: hashIp(clientIp(request.headers)),
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
  };
}

export function throttle(
  scope: string,
  ipHash: string,
  options?: { max?: number; windowMs?: number },
) {
  return rateLimit(`${scope}:${ipHash}`, options);
}

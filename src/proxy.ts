import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  sessionCookieOptions,
  sessionNeedsRefresh,
  verifySessionToken,
} from "@/lib/auth";

const LOGIN_PATH = "/admin/login";
const NO_STORE = "no-store, no-cache, must-revalidate";

/**
 * Optimistic gate only: it checks the cookie's signature and expiry and never
 * touches the database. Server Actions and route handlers verify the session
 * again next to the data they touch.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin");
  const rawToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(rawToken);

  if (pathname === LOGIN_PATH) {
    if (session && request.method === "GET") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (isApi) {
      const response = NextResponse.json(
        { ok: false, error: "unauthorized", message: "Sign in to the admin panel first." },
        { status: 401, headers: { "Cache-Control": NO_STORE } },
      );
      if (rawToken) response.cookies.delete(SESSION_COOKIE);
      return response;
    }
    const login = new URL(LOGIN_PATH, request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(login);
    if (rawToken) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", NO_STORE);
  if (sessionNeedsRefresh(session)) {
    const token = createSessionToken();
    if (token) {
      response.cookies.set(
        SESSION_COOKIE,
        token,
        sessionCookieOptions(new Date(Date.now() + SESSION_TTL_MS)),
      );
    }
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

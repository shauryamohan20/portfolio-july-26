import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Bounces logged-out visitors from /admin to the login page.
 *
 * This is a UI gate only. Next's own docs are explicit that Proxy is not an
 * authorization boundary — Server Actions are POSTs that can be sent directly
 * — so each action re-checks the session with `requireAdmin()`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // No password configured (local development): nothing to sign in to.
  const secret = process.env.SESSION_SECRET ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (password.length < 8 || secret.length < 32) {
    return NextResponse.next();
  }

  const valid = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (valid) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};

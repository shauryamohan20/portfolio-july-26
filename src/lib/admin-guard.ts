import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/**
 * Who may use the admin panel.
 *
 * - In `next dev` on your machine the panel is always available.
 * - Deployed, it exists only when ADMIN_PASSWORD and SESSION_SECRET are both
 *   set, and then only behind a login. Set ENABLE_ADMIN=false to force it off.
 *
 * Proxy (src/proxy.ts) redirects logged-out visitors away from /admin, but
 * that is a UI gate, not a security boundary: Server Actions are reachable by
 * direct POST, so every action calls `requireAdmin()` for itself.
 */

export function adminConfigured() {
  return configProblems().length === 0;
}

/**
 * Why the admin is switched off, in plain language.
 *
 * Returned as a list so a deployed site can log the reason: a bare 404 gives
 * no clue which variable is missing. Values are never logged, only whether
 * they are present and long enough.
 */
export function configProblems(): string[] {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.SESSION_SECRET ?? "";
  const problems: string[] = [];

  if (!password) {
    problems.push("ADMIN_PASSWORD is not set");
  } else if (password.length < 8) {
    problems.push(`ADMIN_PASSWORD is only ${password.length} characters (needs 8+)`);
  }

  if (!secret) {
    problems.push("SESSION_SECRET is not set");
  } else if (secret.length < 32) {
    problems.push(`SESSION_SECRET is only ${secret.length} characters (needs 32+)`);
  }

  return problems;
}

export function adminEnabled() {
  if (process.env.ENABLE_ADMIN === "false") {
    console.warn("[admin] disabled: ENABLE_ADMIN is set to false");
    return false;
  }
  if (process.env.NODE_ENV !== "production") return true;

  const problems = configProblems();
  if (problems.length > 0) {
    console.warn(
      `[admin] returning 404 because ${problems.join(" and ")}. ` +
        "Set them in your hosting environment (Production) and redeploy."
    );
    return false;
  }
  return true;
}

/** True when a login step is required (i.e. a password has been configured). */
export function loginRequired() {
  return adminConfigured();
}

/** Constant-time password comparison, so timing does not leak the password. */
export function passwordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still compare something of equal length to keep the timing flat.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function hasValidSession() {
  if (!loginRequired()) return true; // local dev with no password set
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Throws unless the caller is an authenticated admin. Call this in every action. */
export async function requireAdmin() {
  if (!adminEnabled()) {
    throw new Error("The admin panel is disabled.");
  }
  if (!(await hasValidSession())) {
    throw new Error("Not signed in.");
  }
}

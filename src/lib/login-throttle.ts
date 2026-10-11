/**
 * Crude brute-force brake for the login form.
 *
 * Counters live in the module scope of one server instance, so a host that
 * runs several instances gives an attacker a few more tries per window. That
 * is an accepted limit of a single-password gate with no database — it slows
 * guessing down, it does not make a weak password safe. Use a long password.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const LOCKOUT_MS = 5 * 60 * 1000;

let failures: number[] = [];
let lockedUntil = 0;

/** Seconds remaining on a lockout, or 0 when login may be attempted. */
export function loginBlockedFor() {
  const remaining = lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export function registerFailure() {
  const now = Date.now();
  failures = failures.filter((at) => now - at < WINDOW_MS);
  failures.push(now);

  if (failures.length >= MAX_ATTEMPTS) {
    lockedUntil = now + LOCKOUT_MS;
    failures = [];
  }
}

export function clearFailures() {
  failures = [];
  lockedUntil = 0;
}

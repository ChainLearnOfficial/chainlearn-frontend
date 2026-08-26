/**
 * Minimal JWT payload decoding.
 *
 * This reads the `exp` claim to decide when to refresh. It deliberately does
 * **not** verify the signature: that is the backend's job, and a client-side
 * "verification" would be security theatre since the client cannot hold the
 * signing key. Treat everything here as a scheduling hint, never as an
 * authorization decision.
 */

export interface JwtPayload {
  /** Expiry, in seconds since the epoch (RFC 7519). */
  exp?: number;
  /** Issued-at, in seconds since the epoch. */
  iat?: number;
  sub?: string;
  [claim: string]: unknown;
}

/** Decode a base64url segment in both browser and Node environments. */
function decodeBase64Url(segment: string): string | null {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  try {
    if (typeof atob === "function") {
      return atob(padded);
    }
    // Node fallback, used by the test environment.
    return Buffer.from(padded, "base64").toString("binary");
  } catch {
    return null;
  }
}

/**
 * Decode a JWT's payload, or null if the token is malformed.
 *
 * Returns null rather than throwing: a corrupt token stored from an earlier
 * session should log the user out cleanly, not crash the app on mount.
 */
export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const json = decodeBase64Url(parts[1]);
  if (json === null) return null;

  try {
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Expiry of a token in milliseconds since the epoch, or null when the token is
 * malformed or carries no `exp` claim.
 */
export function getTokenExpiry(token: string | null | undefined): number | null {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
    return null;
  }
  return payload.exp * 1000;
}

/** Milliseconds until expiry. Negative once expired; null if unknown. */
export function getTimeUntilExpiry(
  token: string | null | undefined,
  now: number = Date.now()
): number | null {
  const expiry = getTokenExpiry(token);
  return expiry === null ? null : expiry - now;
}

/**
 * Whether the token is already past its expiry.
 *
 * A token with no readable expiry is reported as *not* expired: we cannot tell,
 * and guessing "expired" would sign users out on a token the backend would
 * still have accepted.
 */
export function isTokenExpired(
  token: string | null | undefined,
  now: number = Date.now()
): boolean {
  const remaining = getTimeUntilExpiry(token, now);
  return remaining === null ? false : remaining <= 0;
}

/**
 * Whether the token is inside the refresh window — close enough to expiry to
 * be worth renewing, but not yet expired.
 *
 * Already-expired tokens return false: the refresh endpoint will reject them,
 * so the correct response is re-authentication, not a doomed refresh call.
 */
export function shouldRefreshToken(
  token: string | null | undefined,
  refreshWindowMs: number,
  now: number = Date.now()
): boolean {
  const remaining = getTimeUntilExpiry(token, now);
  if (remaining === null) return false;
  return remaining > 0 && remaining <= refreshWindowMs;
}

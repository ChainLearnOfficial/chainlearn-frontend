"use client";

import { useCallback, useEffect, useRef } from "react";

import { refreshToken as requestRefreshedTokens } from "@/lib/api/auth";
import { isTokenExpired, shouldRefreshToken } from "@/lib/utils/jwt";
import { useAuthStore } from "@/store/auth-store";

/**
 * Renew the access token before it expires, so a long study session never ends
 * at a login prompt.
 *
 * Access tokens last 24h. Without this, a user mid-module at hour 24 is bounced
 * to SEP-10 re-authentication and loses their place.
 *
 * ── Why these boundaries ────────────────────────────────────────────────────
 *
 * **Refresh at one hour out, not at expiry.** Refreshing on expiry is a race:
 * an in-flight request can still 401 while the refresh is being negotiated. An
 * hour of runway means a failed refresh has time to retry on the next tick, and
 * a user who closes the tab at 23h59m still has a valid token when they return.
 *
 * **Never refresh an already-expired token.** The endpoint will reject it, so
 * the correct response is re-authentication, not a call that is guaranteed to
 * fail. This also stops a tab that woke from sleep past expiry from hammering
 * the endpoint.
 *
 * **Poll rather than schedule a single timer.** A `setTimeout` for hours out is
 * unreliable: browsers throttle timers in background tabs and suspend them when
 * the machine sleeps, so the callback can fire arbitrarily late or not at all.
 * A short interval that re-reads the clock is correct across suspend/resume,
 * and it is cheap because the check is a base64 decode, not a network call.
 */

/** Refresh once the token is within this long of expiring. */
export const REFRESH_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/** How often the expiry check runs. */
export const REFRESH_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export interface UseTokenRefreshOptions {
  /** Override the refresh window. Primarily for tests. */
  refreshWindowMs?: number;
  /** Override the poll interval. Primarily for tests. */
  checkIntervalMs?: number;
  /**
   * Called when refreshing fails and the session cannot be recovered, after the
   * store has been cleared. Lets a caller route to /connect.
   */
  onSessionExpired?: () => void;
}

export interface UseTokenRefreshResult {
  /** Force a refresh attempt now. Resolves true when the token was renewed. */
  refreshNow: () => Promise<boolean>;
}

export function useTokenRefresh(
  options: UseTokenRefreshOptions = {}
): UseTokenRefreshResult {
  const {
    refreshWindowMs = REFRESH_WINDOW_MS,
    checkIntervalMs = REFRESH_CHECK_INTERVAL_MS,
    onSessionExpired,
  } = options;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Guards a refresh already in flight. Without it, the mount check and the
  // first interval tick can both fire a request for the same token.
  const inFlight = useRef(false);

  // Read through refs so the effect below does not re-subscribe on every token
  // change, which would reset the interval each time.
  const onSessionExpiredRef = useRef(onSessionExpired);
  onSessionExpiredRef.current = onSessionExpired;

  const endSession = useCallback(() => {
    useAuthStore.getState().disconnect();
    useAuthStore
      .getState()
      .setError("Your session expired. Please reconnect your wallet.");
    onSessionExpiredRef.current?.();
  }, []);

  const refreshNow = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) return false;

    const { jwt, refreshToken: storedRefreshToken } = useAuthStore.getState();
    if (!jwt || !storedRefreshToken) return false;

    inFlight.current = true;
    try {
      const tokens = await requestRefreshedTokens(storedRefreshToken);
      useAuthStore
        .getState()
        .applyRefreshedTokens(
          tokens.accessToken,
          tokens.expiresIn,
          tokens.refreshToken
        );
      return true;
    } catch {
      // A refresh failure is only fatal once the current token is spent. While
      // it is still valid this is likely a transient network error, and the
      // next tick will try again rather than signing the user out over a blip.
      if (isTokenExpired(useAuthStore.getState().jwt)) {
        endSession();
      }
      return false;
    } finally {
      inFlight.current = false;
    }
  }, [endSession]);

  useEffect(() => {
    // Wait for the persisted store to rehydrate; before that `jwt` is null and
    // every check would be a false negative.
    if (!hasHydrated || !isAuthenticated) return;

    const check = () => {
      const { jwt, refreshToken: storedRefreshToken } = useAuthStore.getState();
      if (!jwt) return;

      if (isTokenExpired(jwt)) {
        // Past the point a refresh can help: re-authenticate.
        endSession();
        return;
      }

      if (!storedRefreshToken) return;

      if (shouldRefreshToken(jwt, refreshWindowMs)) {
        void refreshNow();
      }
    };

    check();
    const timer = setInterval(check, checkIntervalMs);
    return () => clearInterval(timer);
  }, [
    hasHydrated,
    isAuthenticated,
    refreshWindowMs,
    checkIntervalMs,
    refreshNow,
    endSession,
  ]);

  return { refreshNow };
}

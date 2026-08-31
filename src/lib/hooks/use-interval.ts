"use client";

import { useEffect, useRef } from "react";

export interface UseIntervalOptions {
  /** Fire the callback immediately on mount / when the delay changes. */
  immediate?: boolean;
  /**
   * When the callback returns a promise, skip ticks that land while a previous
   * run is still pending instead of letting them overlap. Defaults to true.
   */
  skipWhilePending?: boolean;
}

/**
 * Run `callback` every `delay` ms for polling and periodic updates (#293).
 *
 * Pass `delay = null` to pause the interval; pass a number again to resume.
 * The latest callback is always invoked (no stale closures) and the interval
 * is cleared on unmount and whenever the delay changes.
 *
 * @example
 * // poll reward status every 5s, pause when the tab is hidden
 * useInterval(refreshRewardStatus, isVisible ? 5000 : null);
 */
export function useInterval(
  callback: () => void | Promise<void>,
  delay: number | null,
  options: UseIntervalOptions = {}
): void {
  const { immediate = false, skipWhilePending = true } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const pendingRef = useRef(false);

  useEffect(() => {
    if (delay === null) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (skipWhilePending && pendingRef.current) return;

      const result = callbackRef.current();
      if (result instanceof Promise) {
        pendingRef.current = true;
        result.finally(() => {
          pendingRef.current = false;
        });
      }
    };

    if (immediate) tick();
    const id = setInterval(tick, delay);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [delay, immediate, skipWhilePending]);
}

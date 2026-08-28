"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a value by `delayMs` milliseconds (#226).
 *
 * The returned value only updates after `delayMs` of inactivity on the
 * input, preventing excessive API calls on rapid state changes (e.g.
 * search keystrokes).
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

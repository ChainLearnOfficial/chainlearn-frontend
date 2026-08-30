"use client";

import { useEffect, useRef } from "react";

/**
 * Run a callback when the component unmounts (#295).
 *
 * The latest callback is invoked through a ref, so re-renders don't re-run the
 * effect. Async callbacks are supported.
 */
export function useUnmount(callback: () => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      callbackRef.current();
    };
  }, []);
}
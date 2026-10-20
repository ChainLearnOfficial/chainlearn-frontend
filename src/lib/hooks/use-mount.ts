"use client";

import { useEffect, useRef } from "react";

/**
 * Run a callback only when the component mounts (#294).
 *
 * The latest callback is invoked through a ref, so passing an inline function
 * does not re-run the effect across re-renders. Async callbacks are supported.
 */
export function useMount(callback: () => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    callbackRef.current();
  }, []);
}
"use client";

import { useEffect, useRef } from "react";

/**
 * Access the previous value of a state or prop (#290).
 *
 * Returns `undefined` on the first render and the value from the previous
 * render on subsequent renders, updating after the component re-renders.
 */
export function usePrevious<T>(value: T): T | undefined {
  const previousRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    previousRef.current = value;
  }, [value]);

  return previousRef.current;
}
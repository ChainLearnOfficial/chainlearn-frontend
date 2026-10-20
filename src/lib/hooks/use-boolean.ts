"use client";

import { useCallback, useState } from "react";

/**
 * Reusable boolean toggle hook for open/close, active/inactive states (#291).
 *
 * Returns a tuple of the boolean value and three memoized control functions:
 * `setTrue`, `setFalse`, and `toggle`.
 */
export function useBoolean(
  initialValue = false,
): readonly [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return [value, setTrue, setFalse, toggle];
}
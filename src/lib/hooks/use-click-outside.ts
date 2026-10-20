"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

type ClickOutsideRef = RefObject<HTMLElement | null>;

/**
 * Trigger a callback when a click occurs outside the given ref(s) (#289).
 *
 * Accepts a single ref or an array of refs (e.g. a dropdown trigger and its
 * menu), listens on `mousedown`, and removes the listener on unmount.
 */
export function useClickOutside(
  refs: ClickOutsideRef | ClickOutsideRef[],
  handler: (event: MouseEvent) => void,
) {
  useEffect(() => {
    const clickOutsideRefs = Array.isArray(refs) ? refs : [refs];

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutside = clickOutsideRefs.every(
        (ref) => !ref.current || !ref.current.contains(target),
      );

      if (isOutside) handler(event);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [refs, handler]);
}
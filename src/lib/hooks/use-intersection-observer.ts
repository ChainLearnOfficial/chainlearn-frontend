"use client";

import { useEffect, useMemo, useState, RefObject } from "react";

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | Document | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export interface UseIntersectionObserverResult {
  isIntersecting: boolean;
  entry?: IntersectionObserverEntry;
}

/**
 * Custom hook for observing element intersection using IntersectionObserver API.
 *
 * @param elementRef - React RefObject targeting an HTML element
 * @param options - Observer configuration (threshold, root, rootMargin, freezeOnceVisible)
 * @returns Object with boolean `isIntersecting` status and optional `entry`
 */
export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  {
    threshold = 0,
    root = null,
    rootMargin = "0px",
    freezeOnceVisible = false,
  }: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const isIntersecting = !!entry?.isIntersecting;
  const frozen = isIntersecting && freezeOnceVisible;

  // Keyed on the serialized value so callers passing a new array literal each render don't rebuild the observer.
  const thresholdKey = JSON.stringify(threshold);
  const stableThreshold = useMemo<number | number[]>(() => JSON.parse(thresholdKey), [thresholdKey]);

  useEffect(() => {
    const node = elementRef?.current;
    if (!node || frozen || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([newEntry]) => {
        setEntry(newEntry);
      },
      { threshold: stableThreshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, stableThreshold, root, rootMargin, frozen]);

  return {
    isIntersecting,
    entry,
  };
}

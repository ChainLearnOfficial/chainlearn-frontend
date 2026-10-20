"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api/client";

export interface UseAsyncOptions<TData> {
  /** Run the async function once on mount (only valid when it takes no args). */
  immediate?: boolean;
  /** Extra attempts after the first failure. Aborts are never retried. */
  retries?: number;
  /** Base delay between retries in ms; grows exponentially (1x, 2x, 4x…). */
  retryDelayMs?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export interface UseAsyncResult<TData, TArgs extends unknown[]> {
  /** Invoke the async function. Cancels any in-flight call first. */
  execute: (...args: TArgs) => Promise<TData | undefined>;
  /** Abort the in-flight call, if any. */
  cancel: () => void;
  /** Re-run the last `execute` call with the same arguments. */
  retry: () => Promise<TData | undefined>;
  /** Clear data/error and abort any in-flight call. */
  reset: () => void;
  loading: boolean;
  error: Error | null;
  data: TData | undefined;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Manages the loading / error / data lifecycle of an async operation (#292).
 *
 * The async function receives an `AbortSignal` as its first argument followed
 * by whatever is passed to `execute`. Each `execute` cancels the previous call,
 * and the hook aborts on unmount, so stale results never reach state.
 *
 * @example
 * const { execute, loading, error, data } = useAsync(
 *   (signal, id: string) => getCourse(id, jwt, signal)
 * );
 * // later: execute(courseId)
 */
export function useAsync<TData, TArgs extends unknown[] = []>(
  asyncFn: (signal: AbortSignal, ...args: TArgs) => Promise<TData>,
  options: UseAsyncOptions<TData> = {}
): UseAsyncResult<TData, TArgs> {
  const { immediate = false, retries = 0, retryDelayMs = 500 } = options;

  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  // Latest values held in refs so `execute` stays referentially stable.
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const lastArgsRef = useRef<TArgs | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TData | undefined> => {
      lastArgsRef.current = args;
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const maxRetries = optionsRef.current.retries ?? retries;
      const baseDelay = optionsRef.current.retryDelayMs ?? retryDelayMs;

      for (let attempt = 0; ; attempt++) {
        try {
          const result = await fnRef.current(controller.signal, ...args);
          if (controller.signal.aborted) return undefined;
          if (mountedRef.current && controllerRef.current === controller) {
            setData(result);
            setLoading(false);
          }
          optionsRef.current.onSuccess?.(result);
          return result;
        } catch (err) {
          if (isAbortError(err) || controller.signal.aborted) return undefined;

          if (attempt < maxRetries) {
            await wait(baseDelay * 2 ** attempt);
            if (controller.signal.aborted) return undefined;
            continue;
          }

          const normalized =
            err instanceof Error ? err : new Error("Async operation failed");
          if (mountedRef.current && controllerRef.current === controller) {
            setError(normalized);
            setLoading(false);
          }
          optionsRef.current.onError?.(normalized);
          return undefined;
        }
      }
    },
    [retries, retryDelayMs]
  );

  const retry = useCallback((): Promise<TData | undefined> => {
    return execute(...((lastArgsRef.current ?? []) as TArgs));
  }, [execute]);

  const reset = useCallback(() => {
    cancel();
    if (mountedRef.current) {
      setLoading(false);
      setError(null);
      setData(undefined);
    }
  }, [cancel]);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) {
      void execute(...([] as unknown[] as TArgs));
    }
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { execute, cancel, retry, reset, loading, error, data };
}

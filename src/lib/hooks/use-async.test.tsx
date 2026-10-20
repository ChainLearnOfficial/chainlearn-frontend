import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAsync } from "./use-async";

describe("useAsync", () => {
  it("moves through loading → data on success", async () => {
    const fn = vi.fn(async () => "ok");
    const { result } = renderHook(() => useAsync(fn));

    expect(result.current.loading).toBe(false);

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.execute();
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe("ok");
    expect(result.current.error).toBeNull();
  });

  it("captures errors instead of throwing", async () => {
    const fn = vi.fn(async () => {
      throw new Error("boom");
    });
    const { result } = renderHook(() => useAsync(fn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toEqual(new Error("boom"));
    expect(result.current.data).toBeUndefined();
  });

  it("retries the configured number of times before failing", async () => {
    const fn = vi.fn(async () => {
      throw new Error("nope");
    });
    const { result } = renderHook(() =>
      useAsync(fn, { retries: 2, retryDelayMs: 0 })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    expect(result.current.error).toEqual(new Error("nope"));
  });

  it("forwards execute arguments to the async function after the signal", async () => {
    const fn = vi.fn(async (_signal: AbortSignal, id: string) => `course-${id}`);
    const { result } = renderHook(() => useAsync(fn));

    await act(async () => {
      await result.current.execute("42");
    });

    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "42");
    expect(result.current.data).toBe("course-42");
  });

  it("aborts the in-flight call on unmount", async () => {
    let seenSignal: AbortSignal | undefined;
    const fn = vi.fn(
      (signal: AbortSignal) =>
        new Promise<string>((resolve) => {
          seenSignal = signal;
          signal.addEventListener("abort", () => resolve("late"));
        })
    );
    const { result, unmount } = renderHook(() => useAsync(fn));

    act(() => {
      void result.current.execute();
    });
    unmount();

    expect(seenSignal?.aborted).toBe(true);
  });

  it("cancels a previous call when execute is invoked again", async () => {
    const signals: AbortSignal[] = [];
    const fn = vi.fn(
      (signal: AbortSignal) =>
        new Promise<string>((resolve) => {
          signals.push(signal);
          signal.addEventListener("abort", () => resolve("cancelled"));
        })
    );
    const { result } = renderHook(() => useAsync(fn));

    act(() => {
      void result.current.execute();
    });
    act(() => {
      void result.current.execute();
    });

    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it("runs immediately when the immediate option is set", async () => {
    const fn = vi.fn(async () => "auto");
    const { result } = renderHook(() => useAsync(fn, { immediate: true }));

    await waitFor(() => expect(result.current.data).toBe("auto"));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

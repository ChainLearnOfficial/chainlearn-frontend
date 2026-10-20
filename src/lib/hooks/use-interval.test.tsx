import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useInterval } from "./use-interval";

describe("useInterval", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs the callback on each interval", () => {
    const cb = vi.fn();
    renderHook(() => useInterval(cb, 1000));

    expect(cb).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(3000));
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it("pauses when the delay is null", () => {
    const cb = vi.fn();
    const { rerender } = renderHook(
      ({ delay }: { delay: number | null }) => useInterval(cb, delay),
      { initialProps: { delay: 1000 as number | null } }
    );

    act(() => vi.advanceTimersByTime(2000));
    expect(cb).toHaveBeenCalledTimes(2);

    rerender({ delay: null });
    act(() => vi.advanceTimersByTime(5000));
    expect(cb).toHaveBeenCalledTimes(2); // no more ticks

    rerender({ delay: 1000 });
    act(() => vi.advanceTimersByTime(1000));
    expect(cb).toHaveBeenCalledTimes(3); // resumed
  });

  it("always calls the latest callback", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ cb }: { cb: () => void }) => useInterval(cb, 1000),
      { initialProps: { cb: first } }
    );

    rerender({ cb: second });
    act(() => vi.advanceTimersByTime(1000));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("clears the interval on unmount", () => {
    const cb = vi.fn();
    const { unmount } = renderHook(() => useInterval(cb, 1000));

    unmount();
    act(() => vi.advanceTimersByTime(5000));
    expect(cb).not.toHaveBeenCalled();
  });

  it("fires immediately when the immediate option is set", () => {
    const cb = vi.fn();
    renderHook(() => useInterval(cb, 1000, { immediate: true }));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("skips ticks while an async callback is still pending", async () => {
    let resolve!: () => void;
    const cb = vi.fn(
      () => new Promise<void>((r) => { resolve = r; })
    );
    renderHook(() => useInterval(cb, 1000));

    act(() => vi.advanceTimersByTime(3000));
    expect(cb).toHaveBeenCalledTimes(1); // still pending, later ticks skipped

    await act(async () => {
      resolve();
      await Promise.resolve();
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(cb).toHaveBeenCalledTimes(2);
  });
});

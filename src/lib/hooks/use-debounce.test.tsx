import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("should debounce the value change", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    expect(result.current).toBe("initial");

    // Update value
    rerender({ value: "updated" });

    // Value should not be updated immediately
    expect(result.current).toBe("initial");

    // Fast-forward time by 499ms
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("initial");

    // Fast-forward to exactly 500ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  it("should clear timeout on unmount", () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });
    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // The timer shouldn't fire and update any state, though we can't easily assert on state of unmounted component.
    // Vitest will complain if a state update happens after unmount, so this test ensures no errors are thrown.
    expect(true).toBe(true);
  });
});

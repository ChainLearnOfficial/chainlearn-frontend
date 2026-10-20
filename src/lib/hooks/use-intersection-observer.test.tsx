import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIntersectionObserver } from "./use-intersection-observer";

describe("useIntersectionObserver", () => {
  let observerCallback: IntersectionObserverCallback;
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    mockObserve.mockClear();
    mockDisconnect.mockClear();

    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn().mockImplementation((cb: IntersectionObserverCallback) => {
        observerCallback = cb;
        return {
          observe: mockObserve,
          unobserve: vi.fn(),
          disconnect: mockDisconnect,
        };
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("observes the target element and returns default isIntersecting false", () => {
    const targetEl = document.createElement("div");
    const ref = { current: targetEl };

    const { result } = renderHook(() => useIntersectionObserver(ref));
    expect(mockObserve).toHaveBeenCalledWith(targetEl);
    expect(result.current.isIntersecting).toBe(false);
  });

  it("updates isIntersecting state when observer fires", () => {
    const targetEl = document.createElement("div");
    const ref = { current: targetEl };

    const { result } = renderHook(() => useIntersectionObserver(ref));

    act(() => {
      observerCallback(
        [{ isIntersecting: true, target: targetEl } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isIntersecting).toBe(true);
  });

  it("disconnects observer on unmount", () => {
    const targetEl = document.createElement("div");
    const ref = { current: targetEl };

    const { unmount } = renderHook(() => useIntersectionObserver(ref));
    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});

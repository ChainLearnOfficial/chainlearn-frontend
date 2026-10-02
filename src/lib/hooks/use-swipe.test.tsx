import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSwipe } from "./use-swipe";

describe("useSwipe", () => {
  it("should return touch handlers", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeLeft, onSwipeRight }),
    );

    expect(result.current.handleTouchStart).toBeInstanceOf(Function);
    expect(result.current.handleTouchEnd).toBeInstanceOf(Function);
  });

  it("should call onSwipeRight when swiping right", () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeRight }));

    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    const touchEndEvent = {
      changedTouches: [{ clientX: 200, clientY: 100 }],
    } as React.TouchEvent;

    result.current.handleTouchStart(touchStartEvent);
    result.current.handleTouchEnd(touchEndEvent);

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
  });

  it("should call onSwipeLeft when swiping left", () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeLeft }));

    const touchStartEvent = {
      touches: [{ clientX: 200, clientY: 100 }],
    } as React.TouchEvent;

    const touchEndEvent = {
      changedTouches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    result.current.handleTouchStart(touchStartEvent);
    result.current.handleTouchEnd(touchEndEvent);

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it("should not trigger swipe below threshold", () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight, onSwipeLeft }),
    );

    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    const touchEndEvent = {
      changedTouches: [{ clientX: 130, clientY: 100 }],
    } as React.TouchEvent;

    result.current.handleTouchStart(touchStartEvent);
    result.current.handleTouchEnd(touchEndEvent);

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("should not trigger swipe on vertical movement", () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight, onSwipeLeft }),
    );

    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    const touchEndEvent = {
      changedTouches: [{ clientX: 100, clientY: 200 }],
    } as React.TouchEvent;

    result.current.handleTouchStart(touchStartEvent);
    result.current.handleTouchEnd(touchEndEvent);

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("should handle missing handlers gracefully", () => {
    const { result } = renderHook(() => useSwipe({}));

    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    const touchEndEvent = {
      changedTouches: [{ clientX: 200, clientY: 100 }],
    } as React.TouchEvent;

    expect(() => {
      result.current.handleTouchStart(touchStartEvent);
      result.current.handleTouchEnd(touchEndEvent);
    }).not.toThrow();
  });

  it("should reset touch positions after swipe", () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeRight }));

    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    const touchEndEvent = {
      changedTouches: [{ clientX: 200, clientY: 100 }],
    } as React.TouchEvent;

    result.current.handleTouchStart(touchStartEvent);
    result.current.handleTouchEnd(touchEndEvent);

    expect(onSwipeRight).toHaveBeenCalledTimes(1);

    // Second swipe should still work
    result.current.handleTouchStart(touchStartEvent);
    result.current.handleTouchEnd(touchEndEvent);

    expect(onSwipeRight).toHaveBeenCalledTimes(2);
  });
});

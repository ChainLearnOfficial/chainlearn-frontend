import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useUnmount } from "./use-unmount";

describe("useUnmount", () => {
  it("should call callback on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUnmount(callback));

    expect(callback).not.toHaveBeenCalled();

    unmount();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not call callback on mount", () => {
    const callback = vi.fn();

    renderHook(() => useUnmount(callback));

    expect(callback).not.toHaveBeenCalled();
  });

  it("should not call callback on re-render", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(() => useUnmount(callback));

    rerender();

    expect(callback).not.toHaveBeenCalled();
  });

  it("should call the latest callback on unmount", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { rerender, unmount } = renderHook(({ cb }) => useUnmount(cb), {
      initialProps: { cb: callback1 },
    });

    rerender({ cb: callback2 });
    unmount();

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("should handle async callbacks", async () => {
    const callback = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    const { unmount } = renderHook(() => useUnmount(callback));

    unmount();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

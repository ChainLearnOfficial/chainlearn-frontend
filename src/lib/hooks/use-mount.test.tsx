import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useMount } from "./use-mount";

describe("useMount", () => {
  it("should call callback on mount", () => {
    const callback = vi.fn();

    renderHook(() => useMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not call callback on re-render", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(() => useMount(callback));

    rerender();
    rerender();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should call the latest callback on mount only", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { rerender } = renderHook(({ cb }) => useMount(cb), {
      initialProps: { cb: callback1 },
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    rerender({ cb: callback2 });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();
  });

  it("should handle async callbacks", async () => {
    const callback = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    renderHook(() => useMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

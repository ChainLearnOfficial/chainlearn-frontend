import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePrevious } from "./use-previous";

describe("usePrevious", () => {
  it("should return undefined on first render", () => {
    const { result } = renderHook(() => usePrevious("initial"));

    expect(result.current).toBe(undefined);
  });

  it("should return the previous value after update", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: "initial" },
    });

    expect(result.current).toBe(undefined);

    rerender({ value: "updated" });

    expect(result.current).toBe("initial");
  });

  it("should track multiple updates", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: "value1" },
    });

    rerender({ value: "value2" });
    expect(result.current).toBe("value1");

    rerender({ value: "value3" });
    expect(result.current).toBe("value2");

    rerender({ value: "value4" });
    expect(result.current).toBe("value3");
  });

  it("should work with numbers", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 },
    });

    rerender({ value: 1 });
    expect(result.current).toBe(0);

    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });

  it("should work with objects", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: { id: 1 } },
    });

    rerender({ value: { id: 2 } });
    expect(result.current).toEqual({ id: 1 });
  });

  it("should work with null", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: null },
    });

    rerender({ value: "not-null" });
    expect(result.current).toBe(null);
  });
});

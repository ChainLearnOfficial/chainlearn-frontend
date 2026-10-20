import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useBoolean } from "./use-boolean";

describe("useBoolean", () => {
  it("should initialize with false by default", () => {
    const { result } = renderHook(() => useBoolean());
    
    expect(result.current[0]).toBe(false);
  });

  it("should initialize with provided value", () => {
    const { result } = renderHook(() => useBoolean(true));
    
    expect(result.current[0]).toBe(true);
  });

  it("should set value to true with setTrue", () => {
    const { result } = renderHook(() => useBoolean(false));
    
    act(() => {
      result.current[1]();
    });
    
    expect(result.current[0]).toBe(true);
  });

  it("should set value to false with setFalse", () => {
    const { result } = renderHook(() => useBoolean(true));
    
    act(() => {
      result.current[2]();
    });
    
    expect(result.current[0]).toBe(false);
  });

  it("should toggle value with toggle", () => {
    const { result } = renderHook(() => useBoolean(false));
    
    act(() => {
      result.current[3]();
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      result.current[3]();
    });
    
    expect(result.current[0]).toBe(false);
  });

  it("should maintain stable function references", () => {
    const { result, rerender } = renderHook(() => useBoolean(false));
    
    const setTrue1 = result.current[1];
    const setFalse1 = result.current[2];
    const toggle1 = result.current[3];
    
    rerender();
    
    const setTrue2 = result.current[1];
    const setFalse2 = result.current[2];
    const toggle2 = result.current[3];
    
    expect(setTrue1).toBe(setTrue2);
    expect(setFalse1).toBe(setFalse2);
    expect(toggle1).toBe(toggle2);
  });

  it("should handle multiple rapid state changes", () => {
    const { result } = renderHook(() => useBoolean(false));
    
    act(() => {
      result.current[1]();
      result.current[2]();
      result.current[1]();
      result.current[3]();
    });
    
    expect(result.current[0]).toBe(false);
  });
});

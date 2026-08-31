import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useMediaQuery } from "./use-media-query";

describe("useMediaQuery", () => {
  let listeners: ((e: MediaQueryListEvent) => void)[] = [];

  beforeEach(() => {
    listeners = [];
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("max-width: 768px"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((type, cb) => {
          if (type === "change") listeners.push(cb);
        }),
        removeEventListener: vi.fn((type, cb) => {
          if (type === "change") {
            listeners = listeners.filter((l) => l !== cb);
          }
        }),
        dispatchEvent: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial matching status", () => {
    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false for non-matching query", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 1200px)"));
    expect(result.current).toBe(false);
  });

  it("updates state when media query listener fires", () => {
    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(result.current).toBe(true);

    act(() => {
      listeners.forEach((listener) =>
        listener({ matches: false, media: "(max-width: 768px)" } as MediaQueryListEvent)
      );
    });

    expect(result.current).toBe(false);
  });
});

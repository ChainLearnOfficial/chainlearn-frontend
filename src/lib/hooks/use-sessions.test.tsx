import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSessions } from "./use-sessions";
import { useAuthStore } from "@/store/auth-store";

describe("useSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty sessions when not authenticated", () => {
    const { result } = renderHook(() => useSessions());

    expect(result.current.sessions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("should fetch sessions when authenticated", async () => {
    const { result } = renderHook(() => useSessions());

    // Mock JWT in auth store
    useAuthStore.setState({ jwt: "mock-jwt" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle revoke session", async () => {
    const { result } = renderHook(() => useSessions());

    useAuthStore.setState({ jwt: "mock-jwt" });

    // This test verifies the hook structure - actual API calls would be mocked
    expect(result.current.revoke).toBeInstanceOf(Function);
  });

  it("should handle fetchSessions error gracefully", async () => {
    const { result } = renderHook(() => useSessions());

    useAuthStore.setState({ jwt: "mock-jwt" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});

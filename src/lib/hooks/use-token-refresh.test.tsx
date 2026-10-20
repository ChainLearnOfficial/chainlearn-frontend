import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/store/auth-store";
import { createMemoryStorage, makeJwt } from "@/tests/helpers/jwt";
import {
  REFRESH_CHECK_INTERVAL_MS,
  REFRESH_WINDOW_MS,
  useTokenRefresh,
} from "./use-token-refresh";

// zustand's persist middleware writes on every set(); jsdom's localStorage is
// not usable here, so install a working one before the store module loads.
vi.hoisted(() => {
  const map = new Map<string, string>();
  const storage = {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => { map.delete(key); },
    setItem: (key: string, value: string) => { map.set(key, value); },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    writable: true,
    configurable: true,
  });
});

const refreshTokenMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api/auth", () => ({
  refreshToken: refreshTokenMock,
}));

const HOUR = 60 * 60 * 1000;
const NOW = Date.parse("2026-01-01T12:00:00.000Z");

/** Seed an authenticated session whose token expires `msFromNow` from now. */
function signIn(msFromNow: number, opts: { refreshToken?: string | null } = {}) {
  const jwt = makeJwt({ sub: "GABC", exp: (NOW + msFromNow) / 1000 });
  act(() => {
    useAuthStore.setState({
      walletAddress: "GABC",
      jwt,
      refreshToken: opts.refreshToken === undefined ? "refresh-1" : opts.refreshToken,
      isAuthenticated: true,
      hasHydrated: true,
      tokenExpiresAt: NOW + msFromNow,
      error: null,
    });
  });
  return jwt;
}

beforeEach(() => {
  // shouldAdvanceTime lets real time keep ticking underneath the fake clock,
  // which is what allows testing-library's waitFor to poll while timers are
  // still controllable via advanceTimersByTimeAsync.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(NOW);
  refreshTokenMock.mockReset();
  act(() => {
    useAuthStore.setState({
      walletAddress: null,
      jwt: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      tokenExpiresAt: null,
      error: null,
    });
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useTokenRefresh", () => {
  it("does nothing before the store has hydrated", () => {
    signIn(30 * 60 * 1000);
    act(() => {
      useAuthStore.setState({ hasHydrated: false });
    });

    renderHook(() => useTokenRefresh());

    // Pre-hydration the persisted jwt is not loaded yet; acting on it would be
    // a false negative.
    expect(refreshTokenMock).not.toHaveBeenCalled();
  });

  it("does nothing when unauthenticated", () => {
    act(() => {
      useAuthStore.setState({ hasHydrated: true, isAuthenticated: false });
    });

    renderHook(() => useTokenRefresh());

    expect(refreshTokenMock).not.toHaveBeenCalled();
  });

  it("does not refresh a token that is far from expiry", () => {
    signIn(10 * HOUR);
    renderHook(() => useTokenRefresh());

    expect(refreshTokenMock).not.toHaveBeenCalled();
  });

  it("refreshes on mount when inside the refresh window", async () => {
    signIn(30 * 60 * 1000);
    refreshTokenMock.mockResolvedValue({
      accessToken: makeJwt({ sub: "GABC", exp: (NOW + 24 * HOUR) / 1000 }),
      refreshToken: "refresh-2",
      expiresIn: 86400,
    });

    renderHook(() => useTokenRefresh());

    await waitFor(() => expect(refreshTokenMock).toHaveBeenCalledWith("refresh-1"));
    await waitFor(() =>
      expect(useAuthStore.getState().refreshToken).toBe("refresh-2")
    );
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("refreshes when the interval tick crosses into the window", async () => {
    // Two hours out: outside the one-hour window at mount.
    signIn(2 * HOUR);
    refreshTokenMock.mockResolvedValue({
      accessToken: makeJwt({ sub: "GABC", exp: (NOW + 26 * HOUR) / 1000 }),
      refreshToken: "refresh-2",
      expiresIn: 86400,
    });

    renderHook(() => useTokenRefresh());
    expect(refreshTokenMock).not.toHaveBeenCalled();

    // Advance past the point where only 55 minutes remain.
    await act(async () => {
      vi.setSystemTime(NOW + 65 * 60 * 1000);
      await vi.advanceTimersByTimeAsync(REFRESH_CHECK_INTERVAL_MS);
    });

    await waitFor(() => expect(refreshTokenMock).toHaveBeenCalledTimes(1));
  });

  it("keeps the user signed in across the refresh", async () => {
    signIn(30 * 60 * 1000);
    const renewed = makeJwt({ sub: "GABC", exp: (NOW + 24 * HOUR) / 1000 });
    refreshTokenMock.mockResolvedValue({
      accessToken: renewed,
      refreshToken: "refresh-2",
      expiresIn: 86400,
    });

    renderHook(() => useTokenRefresh());

    await waitFor(() => expect(useAuthStore.getState().jwt).toBe(renewed));
    // No login prompt: the session never drops.
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().error).toBeNull();
  });

  it("does not attempt a refresh for an already-expired token", async () => {
    signIn(-HOUR);
    const onSessionExpired = vi.fn();

    renderHook(() => useTokenRefresh({ onSessionExpired }));

    // The endpoint would reject it, so re-authentication is the only path.
    expect(refreshTokenMock).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    );
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().error).toMatch(/session expired/i);
  });

  it("does nothing when there is no stored refresh token", async () => {
    signIn(30 * 60 * 1000, { refreshToken: null });

    renderHook(() => useTokenRefresh());

    expect(refreshTokenMock).not.toHaveBeenCalled();
    // Still signed in — the current token is valid, just not renewable.
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("keeps the session on a transient refresh failure", async () => {
    signIn(30 * 60 * 1000);
    const onSessionExpired = vi.fn();
    refreshTokenMock.mockRejectedValue(new Error("network blip"));

    renderHook(() => useTokenRefresh({ onSessionExpired }));

    await waitFor(() => expect(refreshTokenMock).toHaveBeenCalled());
    // The current token is still valid, so a failed refresh is not a reason to
    // sign anyone out — the next tick retries.
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("ends the session when the refresh fails and the token has since expired", async () => {
    signIn(1000);
    const onSessionExpired = vi.fn();
    refreshTokenMock.mockImplementation(async () => {
      // The token lapses while the request is in flight.
      vi.setSystemTime(NOW + 5000);
      throw new Error("refresh rejected");
    });

    renderHook(() => useTokenRefresh({ onSessionExpired }));

    await waitFor(() =>
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    );
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().jwt).toBeNull();
  });

  it("retries on the next tick after a transient failure", async () => {
    signIn(30 * 60 * 1000);
    refreshTokenMock.mockRejectedValueOnce(new Error("blip"));
    refreshTokenMock.mockResolvedValueOnce({
      accessToken: makeJwt({ sub: "GABC", exp: (NOW + 24 * HOUR) / 1000 }),
      refreshToken: "refresh-2",
      expiresIn: 86400,
    });

    renderHook(() => useTokenRefresh());
    await waitFor(() => expect(refreshTokenMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(REFRESH_CHECK_INTERVAL_MS);
    });

    await waitFor(() => expect(refreshTokenMock).toHaveBeenCalledTimes(2));
    expect(useAuthStore.getState().refreshToken).toBe("refresh-2");
  });

  it("does not fire overlapping refreshes", async () => {
    signIn(30 * 60 * 1000);
    let release: (value: unknown) => void = () => {};
    refreshTokenMock.mockImplementation(
      () => new Promise((resolve) => { release = resolve; })
    );

    const { result } = renderHook(() => useTokenRefresh());
    await waitFor(() => expect(refreshTokenMock).toHaveBeenCalledTimes(1));

    // A manual call and further ticks while one is in flight must not pile up.
    await act(async () => {
      await result.current.refreshNow();
      await vi.advanceTimersByTimeAsync(REFRESH_CHECK_INTERVAL_MS * 2);
    });

    expect(refreshTokenMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      release({
        accessToken: makeJwt({ sub: "GABC", exp: (NOW + 24 * HOUR) / 1000 }),
        refreshToken: "refresh-2",
        expiresIn: 86400,
      });
    });
  });

  it("keeps the existing refresh token when the backend does not rotate it", async () => {
    signIn(30 * 60 * 1000);
    refreshTokenMock.mockResolvedValue({
      accessToken: makeJwt({ sub: "GABC", exp: (NOW + 24 * HOUR) / 1000 }),
      refreshToken: undefined,
      expiresIn: 86400,
    });

    renderHook(() => useTokenRefresh());

    await waitFor(() => expect(refreshTokenMock).toHaveBeenCalled());
    expect(useAuthStore.getState().refreshToken).toBe("refresh-1");
  });

  it("exposes refreshNow for an on-demand renewal", async () => {
    signIn(10 * HOUR);
    refreshTokenMock.mockResolvedValue({
      accessToken: makeJwt({ sub: "GABC", exp: (NOW + 24 * HOUR) / 1000 }),
      refreshToken: "refresh-2",
      expiresIn: 86400,
    });

    const { result } = renderHook(() => useTokenRefresh());
    expect(refreshTokenMock).not.toHaveBeenCalled();

    let renewed = false;
    await act(async () => {
      renewed = await result.current.refreshNow();
    });

    expect(renewed).toBe(true);
    expect(useAuthStore.getState().refreshToken).toBe("refresh-2");
  });

  it("refreshNow resolves false with no session", async () => {
    act(() => {
      useAuthStore.setState({ hasHydrated: true, isAuthenticated: false, jwt: null });
    });

    const { result } = renderHook(() => useTokenRefresh());

    let renewed = true;
    await act(async () => {
      renewed = await result.current.refreshNow();
    });

    expect(renewed).toBe(false);
    expect(refreshTokenMock).not.toHaveBeenCalled();
  });

  it("stops polling once unmounted", async () => {
    signIn(2 * HOUR);
    refreshTokenMock.mockResolvedValue({
      accessToken: makeJwt({ sub: "GABC", exp: (NOW + 26 * HOUR) / 1000 }),
      refreshToken: "refresh-2",
      expiresIn: 86400,
    });

    const { unmount } = renderHook(() => useTokenRefresh());
    unmount();

    await act(async () => {
      vi.setSystemTime(NOW + 65 * 60 * 1000);
      await vi.advanceTimersByTimeAsync(REFRESH_CHECK_INTERVAL_MS * 3);
    });

    expect(refreshTokenMock).not.toHaveBeenCalled();
  });

  it("uses a one-hour window and five-minute poll by default", () => {
    expect(REFRESH_WINDOW_MS).toBe(HOUR);
    expect(REFRESH_CHECK_INTERVAL_MS).toBe(5 * 60 * 1000);
  });
});

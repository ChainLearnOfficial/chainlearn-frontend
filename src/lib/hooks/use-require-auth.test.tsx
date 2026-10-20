import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

const authState = { isAuthenticated: false, hasHydrated: false };
vi.mock("@/store/auth-store", () => ({
  useAuthStore: (selector: (s: typeof authState) => unknown) => selector(authState),
}));

import { useRequireAuth } from "./use-require-auth";

/**
 * The client-side half of route protection. The middleware handles the request
 * that reaches the Edge; this covers what it cannot see.
 */

beforeEach(() => {
  push.mockClear();
  authState.isAuthenticated = false;
  authState.hasHydrated = false;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useRequireAuth", () => {
  it("is not ready before the store hydrates", () => {
    const { result } = renderHook(() => useRequireAuth());
    expect(result.current.ready).toBe(false);
  });

  it("does not redirect before the store hydrates", () => {
    renderHook(() => useRequireAuth());
    // Redirecting here would bounce a signed-in user on every hard refresh,
    // because the persisted session has not loaded yet.
    expect(push).not.toHaveBeenCalled();
  });

  it("redirects to /connect once hydrated and unauthenticated", () => {
    authState.hasHydrated = true;
    renderHook(() => useRequireAuth());

    expect(push).toHaveBeenCalledWith("/connect");
  });

  it("is ready and does not redirect when authenticated", () => {
    authState.hasHydrated = true;
    authState.isAuthenticated = true;

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.ready).toBe(true);
    expect(push).not.toHaveBeenCalled();
  });

  it("reports the raw authentication flag alongside readiness", () => {
    authState.hasHydrated = true;
    authState.isAuthenticated = true;

    const { result } = renderHook(() => useRequireAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("redirects when a session is lost mid-render", () => {
    authState.hasHydrated = true;
    authState.isAuthenticated = true;
    const { result, rerender } = renderHook(() => useRequireAuth());
    expect(result.current.ready).toBe(true);

    // e.g. the cookie was cleared, or the token expired and useTokenRefresh
    // disconnected the session.
    authState.isAuthenticated = false;
    rerender();

    expect(push).toHaveBeenCalledWith("/connect");
    expect(result.current.ready).toBe(false);
  });
});

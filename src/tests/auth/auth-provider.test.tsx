import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/auth/auth-provider";

// Stub Sidebar and MobileNav to keep tests focused on AuthProvider logic
vi.mock("@/components/layout/sidebar", () => ({
  Sidebar: () => <nav data-testid="sidebar">Sidebar</nav>,
}));
vi.mock("@/components/layout/mobile-nav", () => ({
  MobileNav: () => <nav data-testid="mobile-nav">MobileNav</nav>,
}));

const authState = {
  isAuthenticated: false,
  hasHydrated: false,
};

// AuthProvider mounts useTokenRefresh, which reads the store imperatively via
// getState(), so the mock has to expose it alongside the selector form.
vi.mock("@/store/auth-store", () => {
  const useAuthStore = (selector: (s: typeof authState) => unknown) =>
    selector(authState);
  useAuthStore.getState = () => ({
    ...authState,
    jwt: null,
    refreshToken: null,
    disconnect: vi.fn(),
    setError: vi.fn(),
    applyRefreshedTokens: vi.fn(),
  });
  return { useAuthStore };
});

describe("AuthProvider", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.hasHydrated = false;
  });

  it("renders children", () => {
    render(<AuthProvider><p>page content</p></AuthProvider>);
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("does not render Sidebar before hydration", () => {
    authState.isAuthenticated = true;
    authState.hasHydrated = false;
    render(<AuthProvider><p>page</p></AuthProvider>);
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });

  it("does not render Sidebar when unauthenticated (hydrated)", () => {
    authState.isAuthenticated = false;
    authState.hasHydrated = true;
    render(<AuthProvider><p>page</p></AuthProvider>);
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });

  it("renders Sidebar when hydrated and authenticated", () => {
    authState.isAuthenticated = true;
    authState.hasHydrated = true;
    render(<AuthProvider><p>page</p></AuthProvider>);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders MobileNav when hydrated and authenticated", () => {
    authState.isAuthenticated = true;
    authState.hasHydrated = true;
    render(<AuthProvider><p>page</p></AuthProvider>);
    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
  });

  it("does not render MobileNav when not authenticated", () => {
    authState.isAuthenticated = false;
    authState.hasHydrated = true;
    render(<AuthProvider><p>page</p></AuthProvider>);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
  });
});

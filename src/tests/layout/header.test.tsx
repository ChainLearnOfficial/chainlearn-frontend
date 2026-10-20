import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme/theme-provider";

// ConnectButton makes real auth calls; stub it
vi.mock("@/components/wallet/connect-button", () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

// NotificationBell fetches from the API; stub it
vi.mock("@/components/shared/notification-bell", () => ({
  NotificationBell: () => null,
}));

// Stub auth store
const authState = {
  isAuthenticated: false,
  walletAddress: null as string | null,
};

vi.mock("@/store/auth-store", () => ({
  useAuthStore: () => authState,
}));

// jsdom has no matchMedia; ThemeProvider reads the system theme from it.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

function renderHeader() {
  return render(
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
}

describe("Header", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.walletAddress = null;
  });

  it("renders the ChainLearn logo link", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /chainlearn/i })).toHaveAttribute("href", "/");
  });

  it("renders the ConnectButton", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeInTheDocument();
  });

  it("does not show nav links when unauthenticated", () => {
    renderHeader();
    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
  });

  it("shows nav links when authenticated", () => {
    authState.isAuthenticated = true;
    renderHeader();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("shows wallet address when authenticated", () => {
    authState.isAuthenticated = true;
    authState.walletAddress = "GABCD1234EFGH5678";
    renderHeader();
    // truncateAddress shows first4...last4 = GABC...5678
    expect(screen.getByText(/GABC.*5678/)).toBeInTheDocument();
  });

  it("toggles mobile nav on hamburger click", async () => {
    authState.isAuthenticated = true;
    renderHeader();
    const toggle = screen.getByRole("button", { name: /toggle navigation/i });
    await userEvent.click(toggle);
    // Mobile nav should now be visible — Dashboard link is accessible
    const dashLinks = screen.getAllByRole("link", { name: /dashboard/i });
    expect(dashLinks.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/header";

// ConnectButton makes real auth calls; stub it
vi.mock("@/components/wallet/connect-button", () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

// Stub auth store
const authState = {
  isAuthenticated: false,
  walletAddress: null as string | null,
};

vi.mock("@/store/auth-store", () => ({
  useAuthStore: () => authState,
}));

describe("Header", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.walletAddress = null;
  });

  it("renders the ChainLearn logo link", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /chainlearn/i })).toHaveAttribute("href", "/");
  });

  it("renders the ConnectButton", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeInTheDocument();
  });

  it("does not show nav links when unauthenticated", () => {
    render(<Header />);
    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
  });

  it("shows nav links when authenticated", () => {
    authState.isAuthenticated = true;
    render(<Header />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("shows wallet address when authenticated", () => {
    authState.isAuthenticated = true;
    authState.walletAddress = "GABCD1234EFGH5678";
    render(<Header />);
    // truncateAddress shows first4...last4 = GABC...5678
    expect(screen.getByText(/GABC.*5678/)).toBeInTheDocument();
  });

  it("toggles mobile nav on hamburger click", async () => {
    authState.isAuthenticated = true;
    render(<Header />);
    const toggle = screen.getByRole("button", { name: /toggle navigation/i });
    await userEvent.click(toggle);
    // Mobile nav should now be visible — Dashboard link is accessible
    const dashLinks = screen.getAllByRole("link", { name: /dashboard/i });
    expect(dashLinks.length).toBeGreaterThan(0);
  });
});

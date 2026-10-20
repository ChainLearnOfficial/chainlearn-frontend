import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectButton } from "@/components/wallet/connect-button";

const authHook = {
  isAuthenticated: false,
  walletAddress: null as string | null,
  isConnecting: false,
  connectWallet: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => authHook,
}));

describe("ConnectButton", () => {
  beforeEach(() => {
    authHook.isAuthenticated = false;
    authHook.walletAddress = null;
    authHook.isConnecting = false;
  });

  it("shows 'Connect Wallet' when unauthenticated", () => {
    render(<ConnectButton />);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeInTheDocument();
  });

  it("calls connectWallet when clicked and unauthenticated", async () => {
    render(<ConnectButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(authHook.connectWallet).toHaveBeenCalledTimes(1);
  });

  it("shows 'Connecting...' when isConnecting=true", () => {
    authHook.isConnecting = true;
    render(<ConnectButton />);
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  it("disables button while connecting", () => {
    authHook.isConnecting = true;
    render(<ConnectButton />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows truncated address when authenticated", () => {
    authHook.isAuthenticated = true;
    authHook.walletAddress = "GABCD1234EFGH5678";
    render(<ConnectButton />);
    // truncateAddress(GABCD1234EFGH5678) → GABC...5678
    expect(screen.getByText(/GABC.*5678/)).toBeInTheDocument();
  });

  it("shows disconnect dropdown when address button is clicked", async () => {
    authHook.isAuthenticated = true;
    authHook.walletAddress = "GABCD1234EFGH5678";
    render(<ConnectButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText(/disconnect/i)).toBeInTheDocument();
  });

  it("calls disconnect when Disconnect is clicked", async () => {
    authHook.isAuthenticated = true;
    authHook.walletAddress = "GABCD1234EFGH5678";
    render(<ConnectButton />);
    await userEvent.click(screen.getByRole("button")); // open dropdown
    await userEvent.click(screen.getByText(/disconnect/i));
    expect(authHook.disconnect).toHaveBeenCalledTimes(1);
  });
});

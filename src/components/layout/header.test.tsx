import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/store/auth-store";

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: useAuthStore.getState().isAuthenticated,
    walletAddress: useAuthStore.getState().walletAddress,
    isConnecting: false,
    connectWallet: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

describe("Header", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      walletAddress: null,
      jwt: null,
    });
  });

  it("renders brand name", () => {
    render(<Header />);
    expect(screen.getByText("ChainLearn")).toBeInTheDocument();
  });

  it("hides nav links when unauthenticated", () => {
    render(<Header />);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("shows nav links when authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      walletAddress: "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLM",
      jwt: "token",
    });
    render(<Header />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Courses")).toBeInTheDocument();
  });

  it("toggles mobile navigation", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({
      isAuthenticated: true,
      walletAddress: "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLM",
      jwt: "token",
    });
    render(<Header />);

    const toggle = screen.getByLabelText(/Toggle navigation/i);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

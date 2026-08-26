import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  WalletProvider,
  useWalletContext,
} from "@/components/wallet/wallet-provider";
import { useAuthStore } from "@/store/auth-store";

vi.mock("@/lib/stellar/wallet", () => ({
  getFreighterAddress: vi.fn().mockResolvedValue(null),
}));

function ReadyProbe() {
  const { isReady } = useWalletContext();
  return <span>{isReady ? "ready" : "not-ready"}</span>;
}

describe("WalletProvider", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      walletAddress: null,
      jwt: null,
    });
  });

  it("renders children and exposes ready context", () => {
    render(
      <WalletProvider>
        <ReadyProbe />
      </WalletProvider>
    );
    expect(screen.getByText("ready")).toBeInTheDocument();
  });
});

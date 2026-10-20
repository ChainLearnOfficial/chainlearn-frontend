import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WalletProvider, useWalletContext } from "@/components/wallet/wallet-provider";

const mocks = vi.hoisted(() => ({
  getWalletAddress: vi.fn(),
  disconnect: vi.fn(),
  state: {
    isAuthenticated: false,
    walletProviderId: "freighter" as "freighter" | "lobstr" | "rabet",
    network: "testnet" as "testnet" | "public",
  },
}));

vi.mock("@/lib/stellar/wallet", () => ({
  getWalletAddress: mocks.getWalletAddress,
}));

vi.mock("@/store/auth-store", () => ({
  useAuthStore: () => ({
    ...mocks.state,
    disconnect: mocks.disconnect,
  }),
}));

// Helper to read context value inside the provider
function ContextProbe() {
  const { isReady } = useWalletContext();
  return <span data-testid="ready">{String(isReady)}</span>;
}

describe("WalletProvider", () => {
  beforeEach(() => {
    mocks.state.isAuthenticated = false;
    mocks.state.walletProviderId = "freighter";
    mocks.state.network = "testnet";
    mocks.getWalletAddress.mockReset().mockResolvedValue(null);
    mocks.disconnect.mockReset();
  });

  it("renders children", () => {
    render(
      <WalletProvider>
        <p>child content</p>
      </WalletProvider>
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("exposes isReady=true via context", () => {
    render(
      <WalletProvider>
        <ContextProbe />
      </WalletProvider>
    );
    expect(screen.getByTestId("ready").textContent).toBe("true");
  });

  it("disconnects when the selected provider no longer has the stored address", async () => {
    mocks.state.isAuthenticated = true;
    mocks.state.walletProviderId = "lobstr";

    render(
      <WalletProvider>
        <span>child</span>
      </WalletProvider>
    );

    await waitFor(() => {
      expect(mocks.disconnect).toHaveBeenCalledOnce();
    });
    expect(mocks.getWalletAddress).toHaveBeenCalledWith("lobstr", "testnet");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSupportedWallets: vi.fn(),
  setWallet: vi.fn(),
  getAddress: vi.fn(),
  signMessage: vi.fn(),
  signTransaction: vi.fn(),
  openModal: vi.fn(),
  storage: new Map<string, string>(),
}));

vi.mock("@creit.tech/stellar-wallets-kit/stellar-wallets-kit", () => ({
  StellarWalletsKit: class {
    getSupportedWallets = mocks.getSupportedWallets;
    setWallet = mocks.setWallet;
    getAddress = mocks.getAddress;
    signMessage = mocks.signMessage;
    signTransaction = mocks.signTransaction;
    openModal = mocks.openModal;
  },
}));

vi.mock("@creit.tech/stellar-wallets-kit/types", () => ({
  WalletNetwork: { PUBLIC: "PUBLIC", TESTNET: "TESTNET" },
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/freighter.module", () => ({
  FreighterModule: class {},
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/lobstr.module", () => ({
  LobstrModule: class {},
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/rabet.module", () => ({
  RabetModule: class {},
}));

describe("Stellar wallet adapter", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.storage.clear();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => mocks.storage.get(key) ?? null,
        setItem: (key: string, value: string) => mocks.storage.set(key, value),
        removeItem: (key: string) => mocks.storage.delete(key),
        clear: () => mocks.storage.clear(),
      },
    });
    mocks.getSupportedWallets.mockReset().mockResolvedValue([
      {
        id: "freighter",
        name: "Freighter",
        isAvailable: true,
        url: "https://freighter.app",
      },
      {
        id: "lobstr",
        name: "LOBSTR",
        isAvailable: false,
        url: "https://lobstr.co",
      },
      {
        id: "rabet",
        name: "Rabet",
        isAvailable: true,
        url: "https://rabet.io",
      },
      {
        id: "other",
        name: "Other",
        isAvailable: true,
        url: "https://example.com",
      },
    ]);
    mocks.setWallet.mockReset();
    mocks.getAddress.mockReset().mockResolvedValue({ address: "GADDRESS" });
    mocks.signMessage
      .mockReset()
      .mockResolvedValue({ signedMessage: "signature" });
    mocks.signTransaction
      .mockReset()
      .mockResolvedValue({ signedTxXdr: "signed-xdr" });
    mocks.openModal.mockReset().mockImplementation(({ onWalletSelected }) => {
      onWalletSelected({ id: "rabet" });
      return Promise.resolve();
    });
  });

  it("detects the supported providers and filters unrelated kit wallets", async () => {
    const { getSupportedWallets } = await import("@/lib/stellar/wallet");

    await expect(getSupportedWallets("public")).resolves.toEqual([
      {
        id: "freighter",
        name: "Freighter",
        isAvailable: true,
        url: "https://freighter.app",
      },
      {
        id: "lobstr",
        name: "LOBSTR",
        isAvailable: false,
        url: "https://lobstr.co",
      },
      {
        id: "rabet",
        name: "Rabet",
        isAvailable: true,
        url: "https://rabet.io",
      },
    ]);
  });

  it("lets the user choose a wallet and returns its connected address", async () => {
    const { connectWallet } = await import("@/lib/stellar/wallet");

    await expect(connectWallet("testnet")).resolves.toEqual({
      address: "GADDRESS",
      providerId: "rabet",
    });
    expect(mocks.setWallet).toHaveBeenCalledWith("rabet");
    expect(mocks.storage.get("chainlearn-wallet-provider")).toBe("rabet");
  });

  it("signs transactions through the selected provider", async () => {
    const { signWalletTransaction } = await import("@/lib/stellar/wallet");

    await expect(
      signWalletTransaction("unsigned-xdr", "public", "lobstr"),
    ).resolves.toBe("signed-xdr");
    expect(mocks.setWallet).toHaveBeenCalledWith("lobstr");
    expect(mocks.signTransaction).toHaveBeenCalledWith("unsigned-xdr", {
      networkPassphrase: "Public Global Stellar Network ; September 2015",
    });
  });
});

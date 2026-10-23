import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAccount: vi.fn(),
  prepareTransaction: vi.fn(),
  signMessage: vi.fn(),
  setWallet: vi.fn(),
  storage: new Map<string, string>(),
}));

vi.mock("@creit.tech/stellar-wallets-kit/stellar-wallets-kit", () => ({
  StellarWalletsKit: class {
    getSupportedWallets = vi.fn();
    setWallet = mocks.setWallet;
    getAddress = vi.fn().mockResolvedValue({ address: "GADDRESS" });
    signMessage = mocks.signMessage;
    signTransaction = vi.fn().mockResolvedValue({ signedTxXdr: "signed-xdr" });
    openModal = vi.fn();
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

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const sdk = await importOriginal<typeof import("@stellar/stellar-sdk")>();
  return {
    ...sdk,
    rpc: {
      ...sdk.rpc,
      Server: class {
        getAccount = mocks.getAccount;
        prepareTransaction = mocks.prepareTransaction;
        sendTransaction = vi.fn();
      },
    },
    Horizon: {
      ...sdk.Horizon,
      Server: class {
        loadAccount = vi.fn();
      },
    },
  };
});

describe("wallet network helpers (#535)", () => {
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
  });

  it("returns the correct network passphrases", async () => {
    const { getNetworkPassphrase } = await import("@/lib/stellar/wallet");
    expect(getNetworkPassphrase("public")).toBe(
      "Public Global Stellar Network ; September 2015"
    );
    expect(getNetworkPassphrase("testnet")).toBe(
      "Test SDF Network ; September 2015"
    );
  });

  it("returns the correct Soroban RPC URLs", async () => {
    const { getRpcUrl } = await import("@/lib/stellar/wallet");
    expect(getRpcUrl("public")).toContain("soroban-rpc.mainnet");
    expect(getRpcUrl("testnet")).toContain("soroban-rpc.testnet");
  });

  it("returns the correct Horizon URLs", async () => {
    const { getHorizonUrl } = await import("@/lib/stellar/wallet");
    expect(getHorizonUrl("public")).toBe("https://horizon.stellar.org");
    expect(getHorizonUrl("testnet")).toBe("https://horizon-testnet.stellar.org");
  });

  it("normalizes Freighter network names to NetworkType", async () => {
    const { normalizeNetwork } = await import("@/lib/stellar/wallet");
    expect(normalizeNetwork("PUBLIC")).toBe("public");
    expect(normalizeNetwork("public")).toBe("public");
    expect(normalizeNetwork("TESTNET")).toBe("testnet");
    expect(normalizeNetwork("unknown")).toBe("testnet");
  });

  it("signs a SEP-10 challenge through the selected provider", async () => {
    const { signChallenge } = await import("@/lib/stellar/wallet");
    mocks.signMessage.mockResolvedValue({ signedMessage: "signed-challenge" });

    const result = await signChallenge(
      "challenge-blob",
      "Test SDF Network ; September 2015",
      "freighter"
    );
    expect(result).toBe("signed-challenge");
    expect(mocks.setWallet).toHaveBeenCalledWith("freighter");
    expect(mocks.signMessage).toHaveBeenCalledWith("challenge-blob", {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
  });

  it("throws when the wallet returns an empty signature", async () => {
    const { signChallenge } = await import("@/lib/stellar/wallet");
    mocks.signMessage.mockResolvedValue({ signedMessage: "" });

    await expect(
      signChallenge("challenge-blob", "Test SDF Network ; September 2015", "freighter")
    ).rejects.toThrow(/empty signature/i);
  });

  it("wraps LOBSTR message-signing limitations with a clear error", async () => {
    const { signChallenge } = await import("@/lib/stellar/wallet");
    mocks.signMessage.mockRejectedValue(
      new Error("LOBSTR does not support signMessage")
    );

    await expect(
      signChallenge("challenge-blob", "Test SDF Network ; September 2015", "lobstr")
    ).rejects.toThrow(/message signing/i);
  });
});

describe("toScVal conversion via buildContractInvokeTx (#535)", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.getAccount.mockResolvedValue({ accountId: () => "GSOURCE", sequenceNumber: () => "1" });
    mocks.prepareTransaction.mockImplementation((tx: { toXDR: () => string }) => ({
      toXDR: () => tx.toXDR(),
    }));
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      },
    });
  });

  it("converts string, integer, bigint, and boolean args without throwing", async () => {
    const { buildContractInvokeTx } = await import("@/lib/stellar/transactions");

    const xdr = await buildContractInvokeTx({
      sourceAddress: "GSOURCE",
      contractAddress: "CCONTRACT",
      method: "mint",
      args: ["alice", 42, 2n ** 40n, true],
      network: "testnet",
    });
    expect(typeof xdr).toBe("string");
    expect(xdr.length).toBeGreaterThan(0);
  });

  it("rejects non-integer number arguments", async () => {
    const { buildContractInvokeTx } = await import("@/lib/stellar/transactions");

    await expect(
      buildContractInvokeTx({
        sourceAddress: "GSOURCE",
        contractAddress: "CCONTRACT",
        method: "mint",
        args: [3.14],
        network: "testnet",
      })
    ).rejects.toThrow(/integers/i);
  });

  it("rejects a blank contract method name", async () => {
    const { buildContractInvokeTx } = await import("@/lib/stellar/transactions");

    await expect(
      buildContractInvokeTx({
        sourceAddress: "GSOURCE",
        contractAddress: "CCONTRACT",
        method: "   ",
        network: "testnet",
      })
    ).rejects.toThrow(/method is required/i);
  });
});

describe("simulateContractCall error paths (#535)", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      },
    });
  });

  it("returns the RPC simulation result on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ result: { results: [{ xdr: "AAAA" }] } }),
      })
    );
    const { simulateContractCall } = await import("@/lib/stellar/transactions");

    await expect(
      simulateContractCall("CCONTRACT", "balance", ["GOWNER"], "testnet")
    ).resolves.toEqual({ results: [{ xdr: "AAAA" }] });
    vi.unstubAllGlobals();
  });

  it("throws the RPC error message when the simulation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ error: { message: "contract not found" } }),
      })
    );
    const { simulateContractCall } = await import("@/lib/stellar/transactions");

    await expect(
      simulateContractCall("CCONTRACT", "balance", ["GOWNER"], "testnet")
    ).rejects.toThrow("contract not found");
    vi.unstubAllGlobals();
  });
});

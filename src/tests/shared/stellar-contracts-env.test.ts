import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/stellar/transactions", () => ({
  simulateContractCall: vi.fn(),
  signAndSubmitTransaction: vi.fn(),
}));

const KEYS = [
  "NEXT_PUBLIC_REWARDS_CONTRACT_TESTNET",
  "NEXT_PUBLIC_CREDENTIALS_CONTRACT_TESTNET",
  "NEXT_PUBLIC_REWARDS_CONTRACT_MAINNET",
  "NEXT_PUBLIC_CREDENTIALS_CONTRACT_MAINNET",
] as const;

describe("stellar contracts env validation (#442)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("does not throw at import time when env vars are unset", async () => {
    for (const k of KEYS) vi.stubEnv(k, "");
    await expect(import("@/lib/stellar/contracts")).resolves.toBeDefined();
  });

  it("throws a descriptive error only when an unset address is requested", async () => {
    for (const k of KEYS) vi.stubEnv(k, "");
    const { getContractAddress } = await import("@/lib/stellar/contracts");
    expect(() => getContractAddress("rewards", "testnet")).toThrow(
      /rewards.*not configured for testnet.*NEXT_PUBLIC_REWARDS_CONTRACT_TESTNET/
    );
  });

  it("returns configured addresses, picking them up even if set after import", async () => {
    for (const k of KEYS) vi.stubEnv(k, "");
    const { getContractAddress } = await import("@/lib/stellar/contracts");
    vi.stubEnv("NEXT_PUBLIC_CREDENTIALS_CONTRACT_MAINNET", "CMAINCRED");
    expect(getContractAddress("credentials", "public")).toBe("CMAINCRED");
  });

  it("only requires the network actually in use to be configured", async () => {
    for (const k of KEYS) vi.stubEnv(k, "");
    vi.stubEnv("NEXT_PUBLIC_REWARDS_CONTRACT_TESTNET", "CTESTREW");
    const { getContractAddress } = await import("@/lib/stellar/contracts");
    expect(getContractAddress("rewards", "testnet")).toBe("CTESTREW");
    expect(() => getContractAddress("rewards", "public")).toThrow(/not configured/);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nativeToScVal } from "@stellar/stellar-sdk";
import type { ScValType } from "@stellar/stellar-sdk";

const simulateContractCall = vi.fn();
const signAndSubmitTransaction = vi.fn();

vi.mock("@/lib/stellar/transactions", () => ({
  simulateContractCall: (...args: unknown[]) => simulateContractCall(...args),
  signAndSubmitTransaction: (...args: unknown[]) => signAndSubmitTransaction(...args),
}));

/**
 * Build the shape `simulateContractCall` (via the Soroban RPC's
 * `simulateTransaction`) actually returns: `{ results: [{ xdr }] }`, with a
 * *real* base64 ScVal XDR string, not a hand-rolled stand-in — so these
 * tests exercise contracts.ts's real `decodeFirstSimResult` decode path
 * rather than a fixture that happens to look right.
 */
function simResult(native: unknown, type?: ScValType) {
  const scVal = type ? nativeToScVal(native, { type }) : nativeToScVal(native);
  return { results: [{ xdr: scVal.toXDR("base64") }] };
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_REWARDS_CONTRACT_TESTNET", "CREWARDS");
  vi.stubEnv("NEXT_PUBLIC_CREDENTIALS_CONTRACT_TESTNET", "CCREDENTIALS");
  simulateContractCall.mockReset();
  signAndSubmitTransaction.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getContractBalance / readRewardBalance (#359)", () => {
  it("returns the balance as a string, exact for values beyond Number.MAX_SAFE_INTEGER", async () => {
    const { getContractBalance } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(
      simResult(9007199254740993n, "i128"),
    );

    const balance = await getContractBalance("rewards", "GUSER", "testnet");

    expect(balance).toBe("9007199254740993");
    expect(simulateContractCall).toHaveBeenCalledWith(
      "CREWARDS",
      "balance",
      ["GUSER"],
      "testnet",
    );
  });

  it("readRewardBalance delegates to getContractBalance with the rewards contract", async () => {
    const { readRewardBalance } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(simResult(500n, "i128"));

    const balance = await readRewardBalance("GUSER", "testnet");

    expect(balance).toBe("500");
    expect(simulateContractCall).toHaveBeenCalledWith(
      "CREWARDS",
      "balance",
      ["GUSER"],
      "testnet",
    );
  });

  it("throws when the contract address for the network is not configured", async () => {
    vi.unstubAllEnvs();
    const { getContractBalance } = await import("@/lib/stellar/contracts");

    await expect(
      getContractBalance("rewards", "GUSER", "public"),
    ).rejects.toThrow(/rewards.*not configured for public/);
    expect(simulateContractCall).not.toHaveBeenCalled();
  });

  it("propagates a rejection from simulateContractCall", async () => {
    const { getContractBalance } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockRejectedValue(new Error("RPC unreachable"));

    await expect(
      getContractBalance("rewards", "GUSER", "testnet"),
    ).rejects.toThrow("RPC unreachable");
  });
});

describe("decodeFirstSimResult, via getContractBalance (#359)", () => {
  it("throws for a null/non-object simulation result", async () => {
    const { getContractBalance } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(null);

    await expect(
      getContractBalance("rewards", "GUSER", "testnet"),
    ).rejects.toThrow("Invalid simulation result");
  });

  it("throws when results is present but empty", async () => {
    const { getContractBalance } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue({ results: [] });

    await expect(
      getContractBalance("rewards", "GUSER", "testnet"),
    ).rejects.toThrow("No results in simulation response");
  });

  it("throws when the first result has no xdr field", async () => {
    const { getContractBalance } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue({ results: [{}] });

    await expect(
      getContractBalance("rewards", "GUSER", "testnet"),
    ).rejects.toThrow("Missing XDR in simulation result");
  });

  it("accepts a bare array (no `results` wrapper) as an equivalent shape", async () => {
    const { getContractBalance } = await import("@/lib/stellar/contracts");
    const scVal = nativeToScVal(777n, { type: "i128" });
    simulateContractCall.mockResolvedValue([{ xdr: scVal.toXDR("base64") }]);

    await expect(
      getContractBalance("rewards", "GUSER", "testnet"),
    ).resolves.toBe("777");
  });
});

describe("verifyCredentialOnChain (#359)", () => {
  it("returns valid/owner/issuedAt for a well-formed response (issued_at as u32)", async () => {
    const { verifyCredentialOnChain } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(
      simResult({
        valid: true,
        owner: "GOWNER",
        issued_at: nativeToScVal(1700000000, { type: "u32" }),
      }),
    );

    await expect(verifyCredentialOnChain("token-1", "testnet")).resolves.toEqual({
      valid: true,
      owner: "GOWNER",
      issuedAt: 1700000000,
    });
  });

  it("returns valid: false when the contract reports it false", async () => {
    const { verifyCredentialOnChain } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(simResult({ valid: false, owner: "GOWNER" }));

    await expect(
      verifyCredentialOnChain("token-1", "testnet"),
    ).resolves.toMatchObject({ valid: false });
  });

  it("returns { valid: false } when the decoded result isn't an object", async () => {
    const { verifyCredentialOnChain } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(simResult(true));

    await expect(verifyCredentialOnChain("token-1", "testnet")).resolves.toEqual({
      valid: false,
    });
  });

  it("KNOWN BUG: fails open — a response with no `valid` field reports valid: true (#359)", async () => {
    // `Boolean(record.valid ?? true)` treats an *absent* field the same as
    // an explicit `true`. A contract that omits `valid` (rather than always
    // including it) makes every credential verify as valid. This documents
    // the current behavior; it is not fixed by this test-only PR.
    const { verifyCredentialOnChain } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(
      simResult({ owner: "GOWNER", issued_at: nativeToScVal(1, { type: "u32" }) }),
    );

    await expect(
      verifyCredentialOnChain("token-1", "testnet"),
    ).resolves.toMatchObject({ valid: true });
  });

  it("KNOWN BUG: issuedAt is silently dropped when the contract encodes issued_at as u64 (#359)", async () => {
    // Soroban ScVal decodes u32 to a JS `number` but u64/i128 to a
    // `bigint` (verified against the real SDK: nativeToScVal(n, {type:
    // "u64"}) round-trips through scValToNative as a bigint). This
    // function's `typeof record.issued_at === "number"` guard therefore
    // silently returns `issuedAt: undefined` for a perfectly valid u64
    // timestamp — a plausible encoding for a Unix timestamp, since u32
    // overflows in 2106. Documented, not fixed here.
    const { verifyCredentialOnChain } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(
      simResult({
        valid: true,
        owner: "GOWNER",
        issued_at: nativeToScVal(1700000000, { type: "u64" }),
      }),
    );

    const result = await verifyCredentialOnChain("token-1", "testnet");

    expect(result.valid).toBe(true);
    expect(result.issuedAt).toBeUndefined();
  });

  it("ignores a non-string owner field", async () => {
    const { verifyCredentialOnChain } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(
      simResult({ valid: true, owner: nativeToScVal(123, { type: "u32" }) }),
    );

    const result = await verifyCredentialOnChain("token-1", "testnet");

    expect(result.owner).toBeUndefined();
  });
});

describe("getProgressOnChain (#359)", () => {
  it("returns the decoded percentage", async () => {
    const { getProgressOnChain } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(simResult(42, "u32"));

    await expect(
      getProgressOnChain("GUSER", "course-1", "testnet"),
    ).resolves.toBe(42);
    expect(simulateContractCall).toHaveBeenCalledWith(
      "CCREDENTIALS",
      "get_progress",
      ["GUSER", "course-1"],
      "testnet",
    );
  });

  it("returns 0 for a non-numeric/non-finite decoded value rather than NaN", async () => {
    const { getProgressOnChain } = await import("@/lib/stellar/contracts");
    simulateContractCall.mockResolvedValue(simResult("not-a-number"));

    await expect(
      getProgressOnChain("GUSER", "course-1", "testnet"),
    ).resolves.toBe(0);
  });
});

describe("readCredentialMetadata (#359)", () => {
  it("KNOWN BUG: returns the raw, un-decoded simulation response instead of the decoded metadata (#359)", async () => {
    // Every sibling read helper (getContractBalance, verifyCredentialOnChain,
    // getProgressOnChain) passes simulateContractCall's result through
    // decodeFirstSimResult before returning it. readCredentialMetadata does
    // not — it returns simulateContractCall's raw return value cast to
    // Record<string, unknown>. A caller expecting metadata fields
    // (name, description, ...) gets the RPC envelope shape instead
    // (`{ results: [{ xdr: "<base64>" }] }`), not the decoded object.
    // Documented, not fixed here.
    const { readCredentialMetadata } = await import("@/lib/stellar/contracts");
    const raw = simResult({ name: "Course Completion", description: "..." });
    simulateContractCall.mockResolvedValue(raw);

    const result = await readCredentialMetadata("token-1", "testnet");

    expect(result).toBe(raw);
    expect(result).not.toHaveProperty("name");
    expect(simulateContractCall).toHaveBeenCalledWith(
      "CCREDENTIALS",
      "get_metadata",
      ["token-1"],
      "testnet",
    );
  });
});

describe("claimRewardOnChain / mintCredentialOnChain (#359)", () => {
  it("claimRewardOnChain delegates to signAndSubmitTransaction and returns its result", async () => {
    const { claimRewardOnChain } = await import("@/lib/stellar/contracts");
    const txResult = { hash: "abc123", success: true };
    signAndSubmitTransaction.mockResolvedValue(txResult);

    await expect(claimRewardOnChain("SIGNED_XDR", "testnet")).resolves.toBe(txResult);
    expect(signAndSubmitTransaction).toHaveBeenCalledWith("SIGNED_XDR", "testnet");
  });

  it("mintCredentialOnChain delegates to signAndSubmitTransaction and returns its result", async () => {
    const { mintCredentialOnChain } = await import("@/lib/stellar/contracts");
    const txResult = { hash: "def456", success: true };
    signAndSubmitTransaction.mockResolvedValue(txResult);

    await expect(mintCredentialOnChain("SIGNED_XDR", "testnet")).resolves.toBe(txResult);
    expect(signAndSubmitTransaction).toHaveBeenCalledWith("SIGNED_XDR", "testnet");
  });

  it("propagates a failed transaction result (not a throw) unchanged", async () => {
    const { claimRewardOnChain } = await import("@/lib/stellar/contracts");
    const failure = { hash: "", success: false, error: "insufficient balance" };
    signAndSubmitTransaction.mockResolvedValue(failure);

    await expect(claimRewardOnChain("SIGNED_XDR", "testnet")).resolves.toBe(failure);
  });
});

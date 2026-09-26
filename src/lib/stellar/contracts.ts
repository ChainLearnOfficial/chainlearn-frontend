import type { NetworkType } from "./wallet";
import { simulateContractCall, signAndSubmitTransaction } from "./transactions";
import type { TransactionResult } from "@/types/stellar";
import { xdr, scValToNative } from "@stellar/stellar-sdk";

// Validate required environment variables at startup
function validateEnvironmentVariables() {
  const requiredVars = [
    "NEXT_PUBLIC_REWARDS_CONTRACT_TESTNET",
    "NEXT_PUBLIC_CREDENTIALS_CONTRACT_TESTNET",
    "NEXT_PUBLIC_REWARDS_CONTRACT_MAINNET",
    "NEXT_PUBLIC_CREDENTIALS_CONTRACT_MAINNET",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

// Contract addresses (configurable per network)
const CONTRACT_ADDRESSES: Record<NetworkType, Record<string, string>> = {
  testnet: {
    rewards: process.env.NEXT_PUBLIC_REWARDS_CONTRACT_TESTNET!,
    credentials: process.env.NEXT_PUBLIC_CREDENTIALS_CONTRACT_TESTNET!,
  },
  public: {
    rewards: process.env.NEXT_PUBLIC_REWARDS_CONTRACT_MAINNET!,
    credentials: process.env.NEXT_PUBLIC_CREDENTIALS_CONTRACT_MAINNET!,
  },
};

validateEnvironmentVariables();

/**
 * Get a contract address for the current network.
 */
export function getContractAddress(
  contractName: string,
  network: NetworkType
): string {
  const addr = CONTRACT_ADDRESSES[network]?.[contractName];
  if (!addr) {
    throw new Error(
      `Contract "${contractName}" not configured for ${network}`
    );
  }
  return addr;
}

/** Extract the first simulation result's decoded native value, or throw. */
function decodeFirstSimResult(simResult: unknown): unknown {
  if (!simResult || typeof simResult !== "object") {
    throw new Error("Invalid simulation result");
  }

  const resultArray =
    "results" in simResult && Array.isArray((simResult as Record<string, unknown>).results)
      ? (simResult as Record<string, unknown>).results
      : simResult;
  if (!Array.isArray(resultArray) || resultArray.length === 0) {
    throw new Error("No results in simulation response");
  }

  const result = resultArray[0];
  if (!result.xdr) {
    throw new Error("Missing XDR in simulation result");
  }

  return scValToNative(xdr.ScVal.fromXDR(result.xdr, "base64"));
}

/**
 * Read a balance from any deployed contract that exposes a `balance` method
 * (e.g. the rewards token contract).
 */
export async function getContractBalance(
  contractName: string,
  userAddress: string,
  network: NetworkType
): Promise<string> {
  const contractAddr = getContractAddress(contractName, network);
  const simResult = await simulateContractCall(
    contractAddr,
    "balance",
    [userAddress],
    network
  );
  const balance = decodeFirstSimResult(simResult) as unknown as bigint | number | string;
  return String(balance);
}

/**
 * Read a user's reward token balance via the rewards contract.
 */
export async function readRewardBalance(
  userAddress: string,
  network: NetworkType
): Promise<string> {
  return getContractBalance("rewards", userAddress, network);
}

/**
 * Verify a credential NFT's authenticity directly against the credentials
 * contract, independent of the backend's own verification endpoint — the
 * on-chain call is the source of truth a third party could reproduce.
 */
export async function verifyCredentialOnChain(
  tokenId: string,
  network: NetworkType
): Promise<{ valid: boolean; owner?: string; issuedAt?: number }> {
  const contractAddr = getContractAddress("credentials", network);
  const simResult = await simulateContractCall(
    contractAddr,
    "verify",
    [tokenId],
    network
  );
  const decoded = decodeFirstSimResult(simResult);
  if (!decoded || typeof decoded !== "object") {
    return { valid: false };
  }
  const record = decoded as Record<string, unknown>;
  return {
    valid: Boolean(record.valid ?? true),
    owner: typeof record.owner === "string" ? record.owner : undefined,
    issuedAt: typeof record.issued_at === "number" ? record.issued_at : undefined,
  };
}

/**
 * Read a learner's on-chain course progress.
 *
 * Progress is tracked as part of the credentials contract rather than a
 * separate deployment — there is no dedicated progress contract/env var, and
 * a credential's issuance is itself the on-chain record of course
 * completion. `get_progress` returns the percentage complete (0-100) for the
 * given course.
 */
export async function getProgressOnChain(
  userAddress: string,
  courseId: string,
  network: NetworkType
): Promise<number> {
  const contractAddr = getContractAddress("credentials", network);
  const simResult = await simulateContractCall(
    contractAddr,
    "get_progress",
    [userAddress, courseId],
    network
  );
  const decoded = decodeFirstSimResult(simResult);
  const progress = Number(decoded);
  return Number.isFinite(progress) ? progress : 0;
}

/**
 * Submit a claim reward transaction.
 * Returns a signed + submitted tx result.
 */
export async function claimRewardOnChain(
  xdr: string,
  network: NetworkType
): Promise<TransactionResult> {
  return signAndSubmitTransaction(xdr, network);
}

/**
 * Read a credential NFT's metadata from the credentials contract.
 */
export async function readCredentialMetadata(
  tokenId: string,
  network: NetworkType
): Promise<Record<string, unknown>> {
  const contractAddr = getContractAddress("credentials", network);
  const result = await simulateContractCall(
    contractAddr,
    "get_metadata",
    [tokenId],
    network
  );
  return result as Record<string, unknown>;
}

/**
 * Mint a credential NFT on-chain.
 */
export async function mintCredentialOnChain(
  xdr: string,
  network: NetworkType
): Promise<TransactionResult> {
  return signAndSubmitTransaction(xdr, network);
}

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

/**
 * Read a user's reward token balance via the rewards contract.
 */
export async function readRewardBalance(
  userAddress: string,
  network: NetworkType
): Promise<string> {
  const contractAddr = getContractAddress("rewards", network);
  const simResult = await simulateContractCall(
    contractAddr,
    "balance",
    [userAddress],
    network
  );

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

  const scVal = scValToNative(xdr.ScVal.fromXDR(result.xdr, "base64"));
  const balance = scVal as unknown as bigint | number | string;
  return String(balance);
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

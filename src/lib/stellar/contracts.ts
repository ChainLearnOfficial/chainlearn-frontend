import type { NetworkType } from "./wallet";
import { simulateContractCall, signAndSubmitTransaction } from "./transactions";
import type { TransactionResult } from "@/types/stellar";

// Contract addresses (configurable per network)
const CONTRACT_ADDRESSES: Record<NetworkType, Record<string, string>> = {
  testnet: {
    rewards: process.env.NEXT_PUBLIC_REWARDS_CONTRACT_TESTNET || "",
    credentials: process.env.NEXT_PUBLIC_CREDENTIALS_CONTRACT_TESTNET || "",
  },
  public: {
    rewards: process.env.NEXT_PUBLIC_REWARDS_CONTRACT_MAINNET || "",
    credentials: process.env.NEXT_PUBLIC_CREDENTIALS_CONTRACT_MAINNET || "",
  },
};

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
  const result = await simulateContractCall(
    contractAddr,
    "balance",
    [userAddress],
    network
  );
  return String(result);
}

/**
 * Submit a claim reward transaction.
 * Returns a signed + submitted tx result.
 */
export async function claimRewardOnChain(
  userAddress: string,
  amount: string,
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

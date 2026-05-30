import freighterApi from "@stellar/freighter-api";

export type NetworkType = "testnet" | "public";

/**
 * Check if Freighter wallet extension is installed.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await freighterApi.isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

/**
 * Request access to the user's Freighter wallet.
 * Returns the public key if granted.
 */
export async function connectFreighter(): Promise<string> {
  const allowed = await freighterApi.isAllowed();
  if (!allowed.isAllowed) {
    await freighterApi.requestAccess();
  }
  const result = await freighterApi.getAddress();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.address;
}

/**
 * Get the currently connected Freighter address.
 */
export async function getFreighterAddress(): Promise<string | null> {
  try {
    const result = await freighterApi.getAddress();
    return result.error ? null : result.address;
  } catch {
    return null;
  }
}

/**
 * Sign a challenge message using Freighter for authentication.
 */
export async function signChallenge(
  challenge: string,
  networkPassphrase: string
): Promise<string> {
  const result = await freighterApi.signMessage(challenge, {
    networkPassphrase,
  });
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.signedMessage) {
    throw new Error("Failed to sign message");
  }
  return result.signedMessage.toString();
}

/**
 * Get the network passphrase for the given network type.
 */
export function getNetworkPassphrase(network: NetworkType): string {
  if (network === "public") {
    return "Public Global Stellar Network ; September 2015";
  }
  return "Test SDF Network ; September 2015";
}

/**
 * Get the Soroban RPC URL for the given network.
 */
export function getRpcUrl(network: NetworkType): string {
  if (network === "public") {
    return "https://soroban-rpc.mainnet.stellar.gateway.fm";
  }
  return "https://soroban-rpc.testnet.stellar.gateway.fm";
}

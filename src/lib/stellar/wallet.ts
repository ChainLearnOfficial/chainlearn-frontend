import freighterApi, { WatchWalletChanges } from "@stellar/freighter-api";

export type NetworkType = "testnet" | "public";

export interface WalletChange {
  address: string;
  network: string;
  networkPassphrase: string;
}

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

/** Freighter reports networks as "TESTNET" / "PUBLIC" (and others); map to our two supported values. */
export function normalizeNetwork(network: string): NetworkType {
  return network.toUpperCase() === "PUBLIC" ? "public" : "testnet";
}

/**
 * Start polling Freighter for account or network changes.
 *
 * Freighter has no push-based event API — `WatchWalletChanges` polls
 * `getAddress`/`getNetwork` on an interval and only invokes the callback when
 * a value actually changes, so this is cheap to leave running for the life of
 * the app. Returns a `stop` function; callers must call it on unmount to
 * avoid leaking the poller.
 */
export function watchWalletChanges(
  onChange: (change: WalletChange) => void,
  intervalMs = 3000
): () => void {
  const watcher = new WatchWalletChanges(intervalMs);
  watcher.watch(onChange);
  return () => watcher.stop();
}

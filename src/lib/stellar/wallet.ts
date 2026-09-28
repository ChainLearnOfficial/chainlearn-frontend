import freighterApi, { WatchWalletChanges } from "@stellar/freighter-api";

export type NetworkType = "testnet" | "public";
export type WalletProviderId = "freighter" | "lobstr" | "rabet";

export interface WalletChange {
  address: string;
  network: string;
  networkPassphrase: string;
}

export interface WalletOption {
  id: WalletProviderId;
  name: string;
  isAvailable: boolean;
  url: string;
}

interface WalletKit {
  getSupportedWallets(): Promise<Array<{ id: string; name: string; isAvailable: boolean; url: string }>>;
  setWallet(id: string): void;
  getAddress(options?: { skipRequestAccess?: boolean }): Promise<{ address: string }>;
  signMessage(message: string, options?: { networkPassphrase?: string; address?: string }): Promise<{ signedMessage: string }>;
  signTransaction(xdr: string, options?: { networkPassphrase?: string; address?: string }): Promise<{ signedTxXdr: string }>;
  openModal(options: {
    onWalletSelected: (wallet: { id: string }) => void;
    onClosed?: (error: Error) => void;
  }): Promise<void>;
}

const WALLET_STORAGE_KEY = "chainlearn-wallet-provider";
const walletKits = new Map<NetworkType, Promise<WalletKit>>();
let selectedWalletId: WalletProviderId = "freighter";

function getSavedWalletId(): WalletProviderId {
  if (typeof window === "undefined" || !window.localStorage) return selectedWalletId;
  let savedId: string | null;
  try {
    savedId = window.localStorage.getItem(WALLET_STORAGE_KEY);
  } catch {
    return selectedWalletId;
  }
  if (savedId === "freighter" || savedId === "lobstr" || savedId === "rabet") {
    selectedWalletId = savedId;
  }
  return selectedWalletId;
}

function saveWalletId(id: WalletProviderId): void {
  selectedWalletId = id;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(WALLET_STORAGE_KEY, id);
    } catch {
      // The current session still works when browser storage is unavailable.
    }
  }
}

async function getWalletKit(network: NetworkType): Promise<WalletKit> {
  let kitPromise = walletKits.get(network);
  if (!kitPromise) {
    kitPromise = (async () => {
      const [
        { StellarWalletsKit },
        { WalletNetwork },
        { FreighterModule },
        { LobstrModule },
        { RabetModule },
      ] = await Promise.all([
        import("@creit.tech/stellar-wallets-kit/stellar-wallets-kit"),
        import("@creit.tech/stellar-wallets-kit/types"),
        import("@creit.tech/stellar-wallets-kit/modules/freighter.module"),
        import("@creit.tech/stellar-wallets-kit/modules/lobstr.module"),
        import("@creit.tech/stellar-wallets-kit/modules/rabet.module"),
      ]);

      return new StellarWalletsKit({
        network: network === "public" ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
        selectedWalletId: getSavedWalletId(),
        modules: [new FreighterModule(), new LobstrModule(), new RabetModule()],
      });
    })();
    walletKits.set(network, kitPromise);
  }
  return kitPromise;
}

export async function getSupportedWallets(network: NetworkType = "testnet"): Promise<WalletOption[]> {
  const kit = await getWalletKit(network);
  const supportedWallets = await kit.getSupportedWallets();
  return supportedWallets
    .filter((wallet): wallet is typeof wallet & { id: WalletProviderId } =>
      wallet.id === "freighter" || wallet.id === "lobstr" || wallet.id === "rabet"
    )
    .map(({ id, name, isAvailable, url }) => ({ id, name, isAvailable, url }));
}

export async function connectWallet(
  network: NetworkType,
  providerId?: WalletProviderId
): Promise<{ address: string; providerId: WalletProviderId }> {
  const kit = await getWalletKit(network);
  let selectedId = providerId;

  if (!selectedId) {
    selectedId = await new Promise<WalletProviderId>((resolve, reject) => {
      void kit.openModal({
        onWalletSelected: ({ id }) => {
          if (id === "freighter" || id === "lobstr" || id === "rabet") {
            resolve(id);
          } else {
            reject(new Error("The selected wallet is not supported."));
          }
        },
        onClosed: reject,
      }).catch(reject);
    });
  }

  kit.setWallet(selectedId);
  saveWalletId(selectedId);
  const { address } = await kit.getAddress();
  return { address, providerId: selectedId };
}

export async function getWalletAddress(
  providerId: WalletProviderId = getSavedWalletId(),
  network: NetworkType = "testnet"
): Promise<string | null> {
  try {
    const kit = await getWalletKit(network);
    kit.setWallet(providerId);
    const { address } = await kit.getAddress({ skipRequestAccess: true });
    return address || null;
  } catch {
    return null;
  }
}

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await freighterApi.isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

export async function connectFreighter(): Promise<string> {
  const { address } = await connectWallet("testnet", "freighter");
  return address;
}

export async function getFreighterAddress(): Promise<string | null> {
  return getWalletAddress("freighter");
}

export async function signChallenge(
  challenge: string,
  networkPassphrase: string,
  providerId: WalletProviderId = getSavedWalletId()
): Promise<string> {
  const network = networkPassphrase === getNetworkPassphrase("public") ? "public" : "testnet";
  const kit = await getWalletKit(network);
  kit.setWallet(providerId);
  try {
    const { signedMessage } = await kit.signMessage(challenge, { networkPassphrase });
    if (!signedMessage) throw new Error("Wallet returned an empty signature.");
    return signedMessage;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (providerId !== "freighter" && message.toLowerCase().includes("does not support")) {
      throw new Error(
        `${providerId === "lobstr" ? "LOBSTR" : "Rabet"} can connect and sign transactions, but this authentication flow requires message signing.`
      );
    }
    throw error;
  }
}

export async function signWalletTransaction(
  transactionXdr: string,
  network: NetworkType,
  providerId: WalletProviderId = getSavedWalletId()
): Promise<string> {
  const kit = await getWalletKit(network);
  kit.setWallet(providerId);
  const { signedTxXdr } = await kit.signTransaction(transactionXdr, {
    networkPassphrase: getNetworkPassphrase(network),
  });
  if (!signedTxXdr) throw new Error("Wallet returned an empty signed transaction.");
  return signedTxXdr;
}

/** Get the currently selected provider after the user chooses a wallet. */
export function getSelectedWalletId(): WalletProviderId {
  return getSavedWalletId();
}

/** Get the network passphrase for the given network type. */
export function getNetworkPassphrase(network: NetworkType): string {
  if (network === "public") {
    return "Public Global Stellar Network ; September 2015";
  }
  return "Test SDF Network ; September 2015";
}

/** Get the Soroban RPC URL for the given network. */
export function getRpcUrl(network: NetworkType): string {
  if (network === "public") {
    return "https://soroban-rpc.mainnet.stellar.gateway.fm";
  }
  return "https://soroban-rpc.testnet.stellar.gateway.fm";
}

export function getHorizonUrl(network: NetworkType): string {
  return network === "public"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}

/** Freighter reports networks as "TESTNET" / "PUBLIC" (and others). */
export function normalizeNetwork(network: string): NetworkType {
  return network.toUpperCase() === "PUBLIC" ? "public" : "testnet";
}

/** Start polling Freighter for account or network changes. */
export function watchWalletChanges(
  onChange: (change: WalletChange) => void,
  intervalMs = 3000
): () => void {
  const watcher = new WatchWalletChanges(intervalMs);
  watcher.watch(onChange);
  return () => watcher.stop();
}
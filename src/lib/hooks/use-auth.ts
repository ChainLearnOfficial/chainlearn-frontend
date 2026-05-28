"use client";

import { useCallback, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  connectFreighter,
  isFreighterInstalled,
  signChallenge,
  getNetworkPassphrase,
} from "@/lib/stellar/wallet";
import { getChallenge, verifySignature } from "@/lib/api/auth";

export function useAuth() {
  const {
    walletAddress,
    jwt,
    isAuthenticated,
    network,
    connect,
    disconnect: storeDisconnect,
  } = useAuthStore();

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check Freighter is installed
      const installed = await isFreighterInstalled();
      if (!installed) {
        throw new Error(
          "Freighter wallet extension is not installed. Please install it from freighter.app"
        );
      }

      // Connect to Freighter
      const address = await connectFreighter();

      // Get challenge from backend
      const challenge = await getChallenge(address);

      // Sign challenge with Freighter
      const passphrase = getNetworkPassphrase(network);
      const signedChallenge = await signChallenge(challenge, passphrase);

      // Verify signature and get JWT
      const tokens = await verifySignature(address, signedChallenge);

      // Store in Zustand
      connect(address, tokens.accessToken);

      return address;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Connection failed";
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [network, connect]);

  const disconnect = useCallback(() => {
    storeDisconnect();
    setError(null);
  }, [storeDisconnect]);

  return {
    walletAddress,
    jwt,
    isAuthenticated,
    isConnecting,
    error,
    connectWallet,
    disconnect,
  };
}

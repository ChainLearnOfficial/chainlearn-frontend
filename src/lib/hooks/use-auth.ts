"use client";

import { useCallback, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  connectWallet as connectStellarWallet,
  signChallenge,
  getNetworkPassphrase,
} from "@/lib/stellar/wallet";
import { getChallenge, verifySignature } from "@/lib/api/auth";
import type { WalletInfo } from "@/types/stellar";

export interface WalletError {
  type:
    | "not_installed"
    | "user_denied"
    | "wrong_network"
    | "timeout"
    | "connection_failed"
    | "unknown";
  message: string;
  resolution: string;
}

export type WalletConnectionStage = "idle" | "detect" | "connect" | "sign" | "verify" | "complete";

// Helper to classify wallet errors
function classifyWalletError(err: unknown, currentNetwork: string): WalletError {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (
    lower.includes("not installed") ||
    lower.includes("is not installed") ||
    lower.includes("freighter") && lower.includes("install")
  ) {
    return {
      type: "not_installed",
      message: "No supported Stellar wallet was detected",
      resolution: "Install and unlock Freighter, Lobstr, or Rabet, then try again.",
    };
  }

  if (
    lower.includes("denied") ||
    lower.includes("rejected") ||
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("request access") && lower.includes("denied")
  ) {
    return {
      type: "user_denied",
      message: "Connection request was denied",
      resolution: "Approve the connection request in your wallet, then try again.",
    };
  }

  if (
    lower.includes("network") &&
    (lower.includes("mismatch") || lower.includes("wrong") || lower.includes("expected"))
  ) {
    return {
      type: "wrong_network",
      message: `Wallet is on the wrong network (expected ${currentNetwork})`,
      resolution: `Switch your selected wallet to ${currentNetwork} and try again.`,
    };
  }

  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("deadline")
  ) {
    return {
      type: "timeout",
      message: "Connection request timed out",
      resolution: "Check your network connection and try again.",
    };
  }

  if (
    lower.includes("connect") ||
    lower.includes("failed to") ||
    lower.includes("cannot")
  ) {
    return {
      type: "connection_failed",
      message: "Failed to connect to wallet",
      resolution: "Make sure your selected wallet is unlocked and try again.",
    };
  }

  return {
    type: "unknown",
    message: msg || "Connection failed",
    resolution: "Please try again or choose another supported wallet.",
  };
}

export function useAuth() {
  const {
    walletAddress,
    walletProviderId,
    jwt,
    isAuthenticated,
    isConnecting,
    network,
    error,
    connect,
    disconnect: storeDisconnect,
    setIsConnecting,
    setError,
    clearError,
  } = useAuthStore();

  const networkRef = useRef(network);
  networkRef.current = network;

  const [walletError, setWalletError] = useState<WalletError | null>(null);
  const walletErrorRef = useRef(walletError);
  walletErrorRef.current = walletError;
  const [connectionStage, setConnectionStage] =
    useState<WalletConnectionStage>("idle");

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setConnectionStage("detect");
    clearError();
    setWalletError(null);

    try {
      const { address, providerId } = await connectStellarWallet(networkRef.current);
      // Check Freighter is installed
      const installed = await isFreighterInstalled();
      if (!installed) {
        const walletErr: WalletError = {
          type: "not_installed",
          message: "Freighter wallet extension is not installed",
          resolution:
            "Install Freighter from freighter.app and refresh this page.",
        };
        setWalletError(walletErr);
        setError(walletErr.message);
        throw new Error(walletErr.message);
      }

      // Connect to Freighter
      setConnectionStage("connect");
      const address = await connectFreighter();

      // Get challenge from backend
      const challenge = await getChallenge(address);

      // Sign the backend challenge with the selected wallet.
      // Sign challenge with Freighter
      setConnectionStage("sign");
      const passphrase = getNetworkPassphrase(networkRef.current);
      const signedChallenge = await signChallenge(challenge, passphrase, providerId);

      // Verify signature and get JWT
      setConnectionStage("verify");
      const tokens = await verifySignature(address, signedChallenge);

      // Store in Zustand. The refresh token is kept so useTokenRefresh can
      // renew the session without another SEP-10 round trip.
      connect(
        address,
        tokens.accessToken,
        tokens.expiresIn,
        tokens.refreshToken,
        providerId
      );
      setConnectionStage("complete");

      return address;
    } catch (err) {
      // If we already set walletError (e.g. not_installed), don't re-classify
      if (!walletErrorRef.current) {
        const walletErr = classifyWalletError(err, networkRef.current);
        setWalletError(walletErr);
        setError(walletErr.message);
      }
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [connect, setIsConnecting, clearError, setError]);

  const disconnect = useCallback(() => {
    storeDisconnect();
    setWalletError(null);
  }, [storeDisconnect]);

  const dismissError = useCallback(() => {
    setWalletError(null);
    clearError();
  }, [clearError]);

  const walletInfo: WalletInfo | null = walletAddress
    ? {
        publicKey: walletAddress,
        network,
        isConnected: isAuthenticated,
      }
    : null;

  return {
    walletAddress,
    walletProviderId,
    jwt,
    isAuthenticated,
    isConnecting,
    connectionStage,
    error,
    walletError,
    walletInfo,
    connectWallet,
    disconnect,
    dismissError,
  };
}

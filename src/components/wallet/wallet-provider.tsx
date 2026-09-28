"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getWalletAddress } from "@/lib/stellar/wallet";

interface WalletContextValue {
  isReady: boolean;
}

const WalletContext = createContext<WalletContextValue>({ isReady: false });

export function useWalletContext() {
  return useContext(WalletContext);
}

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * WalletProvider initializes the wallet connection state on mount.
 * It checks whether the selected provider is still connected.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const { isAuthenticated, walletProviderId, network, disconnect } = useAuthStore();

  useEffect(() => {
    async function checkConnection() {
      if (!isAuthenticated) return;

      try {
        const address = await getWalletAddress(walletProviderId ?? undefined, network);
        if (!address) {
          disconnect();
        }
      } catch (err) {
        console.error("Wallet connection check failed:", err);
        disconnect();
      }
    }

    checkConnection();
  }, [isAuthenticated, walletProviderId, network, disconnect]);

  return (
    <WalletContext.Provider value={{ isReady: true }}>
      {children}
    </WalletContext.Provider>
  );
}

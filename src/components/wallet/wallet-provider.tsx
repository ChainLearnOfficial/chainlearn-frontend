"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getFreighterAddress } from "@/lib/stellar/wallet";

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
 * It checks if Freighter is already connected and syncs with the store.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const { isAuthenticated, disconnect } = useAuthStore();

  useEffect(() => {
    async function checkConnection() {
      if (!isAuthenticated) return;

      try {
        const address = await getFreighterAddress();
        // If Freighter returns no address but store says we're connected,
        // the user disconnected externally
        if (!address) {
          disconnect();
        }
      } catch {
        // Freighter not available or user denied access
      }
    }

    checkConnection();
  }, [isAuthenticated, disconnect]);

  return (
    <WalletContext.Provider value={{ isReady: true }}>
      {children}
    </WalletContext.Provider>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  walletAddress: string | null;
  jwt: string | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  network: "testnet" | "public";
  tokenExpiresAt: number | null;
  connect: (address: string, token: string, expiresIn?: number) => void;
  disconnect: () => void;
  setJwt: (token: string, expiresIn?: number) => void;
  setNetwork: (network: "testnet" | "public") => void;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      walletAddress: null,
      jwt: null,
      isAuthenticated: false,
      isConnecting: false,
      network: "testnet",
      tokenExpiresAt: null,

      connect: (address: string, token: string, expiresIn?: number) =>
        set({
          walletAddress: address,
          jwt: token,
          isAuthenticated: true,
          isConnecting: false,
          tokenExpiresAt: expiresIn
            ? Date.now() + expiresIn * 1000
            : null,
        }),

      disconnect: () =>
        set({
          walletAddress: null,
          jwt: null,
          isAuthenticated: false,
          tokenExpiresAt: null,
        }),

      setJwt: (token: string, expiresIn?: number) =>
        set({
          jwt: token,
          tokenExpiresAt: expiresIn
            ? Date.now() + expiresIn * 1000
            : get().tokenExpiresAt,
        }),

      setNetwork: (network) => set({ network }),

      isTokenExpired: () => {
        const { tokenExpiresAt, jwt } = get();
        if (!jwt || !tokenExpiresAt) return false;
        return Date.now() >= tokenExpiresAt;
      },
    }),
    {
      name: "chainlearn-auth",
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        jwt: state.jwt,
        isAuthenticated: state.isAuthenticated,
        network: state.network,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
    }
  )
);

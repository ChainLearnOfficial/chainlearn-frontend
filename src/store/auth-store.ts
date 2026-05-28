import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  walletAddress: string | null;
  jwt: string | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  network: "testnet" | "public";
  connect: (address: string, token: string) => void;
  disconnect: () => void;
  setJwt: (token: string) => void;
  setNetwork: (network: "testnet" | "public") => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      walletAddress: null,
      jwt: null,
      isAuthenticated: false,
      isConnecting: false,
      network: "testnet",

      connect: (address: string, token: string) =>
        set({
          walletAddress: address,
          jwt: token,
          isAuthenticated: true,
          isConnecting: false,
        }),

      disconnect: () =>
        set({
          walletAddress: null,
          jwt: null,
          isAuthenticated: false,
        }),

      setJwt: (token: string) => set({ jwt: token }),

      setNetwork: (network) => set({ network }),
    }),
    {
      name: "chainlearn-auth",
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        jwt: state.jwt,
        isAuthenticated: state.isAuthenticated,
        network: state.network,
      }),
    }
  )
);

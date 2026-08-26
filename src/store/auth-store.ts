import { create } from "zustand";
import { persist } from "zustand/middleware";

function setSessionCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `chainlearn-session=${token}; path=/; max-age=86400; SameSite=Lax`;
  } else {
    document.cookie = "chainlearn-session=; path=/; max-age=0";
  }
}

interface AuthState {
  walletAddress: string | null;
  jwt: string | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  hasHydrated: boolean;
  network: "testnet" | "public";
  tokenExpiresAt: number | null;
  error: string | null;
  connect: (address: string, token: string, expiresIn?: number) => void;
  disconnect: () => void;
  setJwt: (token: string, expiresIn?: number) => void;
  setIsConnecting: (value: boolean) => void;
  setNetwork: (network: "testnet" | "public") => void;
  isTokenExpired: () => boolean;
  setHasHydrated: (value: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      walletAddress: null,
      jwt: null,
      isAuthenticated: false,
      isConnecting: false,
      hasHydrated: false,
      network: "testnet",
      tokenExpiresAt: null,
      error: null,

      connect: (address: string, token: string, expiresIn?: number) => {
        setSessionCookie(token);
        set({
          walletAddress: address,
          jwt: token,
          isAuthenticated: true,
          isConnecting: false,
          tokenExpiresAt: expiresIn
            ? Date.now() + expiresIn * 1000
            : null,
          error: null,
        });
      },

      disconnect: () => {
        setSessionCookie(null);
        set({
          walletAddress: null,
          jwt: null,
          isAuthenticated: false,
          tokenExpiresAt: null,
          error: null,
        });
      },

      setJwt: (token: string, expiresIn?: number) =>
        set({
          jwt: token,
          tokenExpiresAt: expiresIn
            ? Date.now() + expiresIn * 1000
            : get().tokenExpiresAt,
        }),

      setNetwork: (network) => set({ network }),

      setIsConnecting: (value: boolean) => set({ isConnecting: value }),

      isTokenExpired: () => {
        const { tokenExpiresAt, jwt } = get();
        if (!jwt || !tokenExpiresAt) return false;
        return Date.now() >= tokenExpiresAt;
      },

      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),
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
      onRehydrateStorage: () => {
        return () => {
          useAuthStore.getState().setHasHydrated(true);
        };
      },
    }
  )
);

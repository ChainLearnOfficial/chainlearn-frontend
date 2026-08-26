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
  /**
   * Long-lived token used to mint a new access token. Persisted because a
   * refresh has to survive a page reload — that is the whole point of it.
   */
  refreshToken: string | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  hasHydrated: boolean;
  network: "testnet" | "public";
  tokenExpiresAt: number | null;
  error: string | null;
  connect: (
    address: string,
    token: string,
    expiresIn?: number,
    refreshToken?: string
  ) => void;
  disconnect: () => void;
  setJwt: (token: string, expiresIn?: number) => void;
  /** Apply a refreshed token pair without disturbing the rest of the session. */
  applyRefreshedTokens: (
    token: string,
    expiresIn?: number,
    refreshToken?: string
  ) => void;
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
      refreshToken: null,
      isAuthenticated: false,
      isConnecting: false,
      hasHydrated: false,
      network: "testnet",
      tokenExpiresAt: null,
      error: null,

      connect: (
        address: string,
        token: string,
        expiresIn?: number,
        refreshToken?: string
      ) => {
        setSessionCookie(token);
        set({
          walletAddress: address,
          jwt: token,
          refreshToken: refreshToken ?? null,
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
          refreshToken: null,
          isAuthenticated: false,
          tokenExpiresAt: null,
          error: null,
        });
      },

      setJwt: (token: string, expiresIn?: number) => {
        // The middleware authorizes on this cookie, so it has to move with the
        // token. Leaving it stale would let the cookie lapse mid-session and
        // bounce an authenticated user to /connect.
        setSessionCookie(token);
        set({
          jwt: token,
          tokenExpiresAt: expiresIn
            ? Date.now() + expiresIn * 1000
            : get().tokenExpiresAt,
        });
      },

      applyRefreshedTokens: (
        token: string,
        expiresIn?: number,
        refreshToken?: string
      ) => {
        setSessionCookie(token);
        set({
          jwt: token,
          // Backends that rotate refresh tokens send a new one; those that do
          // not omit it, and the existing one stays valid.
          refreshToken: refreshToken ?? get().refreshToken,
          tokenExpiresAt: expiresIn
            ? Date.now() + expiresIn * 1000
            : get().tokenExpiresAt,
          error: null,
        });
      },

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
        refreshToken: state.refreshToken,
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

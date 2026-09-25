import { apiClient } from "./client";
import type { AuthTokens, UserProfile, UserSession } from "@/types/api";
import { useAuthStore } from "@/store/auth-store";
import { getTokenExpiry, isTokenExpired } from "@/lib/utils/jwt";

/** 1 hour in milliseconds — refresh threshold before expiry */
const REFRESH_THRESHOLD_MS = 60 * 60 * 1000;

let inFlightRefreshPromise: Promise<string | null> | null = null;

/**
 * Request a challenge message for wallet-based authentication.
 */
export async function getChallenge(
  walletAddress: string,
  signal?: AbortSignal
): Promise<string> {
  const response = await apiClient.get<{ challenge: string }>(
    `/auth/challenge?address=${encodeURIComponent(walletAddress)}`,
    undefined,
    signal
  );
  return response.data.challenge;
}

/**
 * Submit a signed challenge to authenticate and receive JWT tokens.
 */
export async function verifySignature(
  walletAddress: string,
  signedChallenge: string,
  signal?: AbortSignal
): Promise<AuthTokens> {
  const response = await apiClient.post<AuthTokens>(
    "/auth/verify",
    {
      walletAddress,
      signedChallenge,
    },
    undefined,
    signal
  );
  return response.data;
}

/**
 * Fetch the authenticated user's profile.
 */
export async function getProfile(
  jwt: string,
  signal?: AbortSignal
): Promise<UserProfile> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<UserProfile>("/auth/profile", token, signal);
  return response.data;
}

/**
 * Create or update the user's onboarding profile.
 */
export async function updateProfile(
  jwt: string,
  profile: Partial<UserProfile>,
  signal?: AbortSignal
): Promise<UserProfile> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.put<UserProfile>(
    "/auth/profile",
    profile,
    token,
    signal
  );
  return response.data;
}

/**
 * Refresh an expired access token using POST /api/v1/auth/refresh (or /auth/refresh).
 */
export async function refreshToken(
  token: string,
  signal?: AbortSignal
): Promise<AuthTokens> {
  try {
    const response = await apiClient.post<AuthTokens>(
      "/auth/refresh",
      { refreshToken: token },
      undefined,
      signal
    );
    return response.data;
  } catch (error) {
    // Fallback to /api/v1/auth/refresh if configured
    try {
      const response = await apiClient.post<AuthTokens>(
        "/api/v1/auth/refresh",
        { refreshToken: token },
        undefined,
        signal
      );
      return response.data;
    } catch {
      throw error;
    }
  }
}

/**
 * Check JWT expiry before requests and automatically refresh if within 1 hour of expiry.
 * If expired and cannot be refreshed, triggers re-authentication.
 */
export async function getValidToken(): Promise<string | null> {
  const store = useAuthStore.getState();
  const { jwt, refreshToken: storedRefreshToken, tokenExpiresAt } = store;

  if (!jwt) return null;

  const now = Date.now();
  const expiry = tokenExpiresAt ?? getTokenExpiry(jwt);

  // If already expired, attempt refresh or trigger re-authentication
  if (expiry && expiry <= now) {
    if (storedRefreshToken) {
      return executeRefresh(storedRefreshToken);
    }
    store.disconnect();
    store.setError("Session expired. Please reconnect your wallet.");
    return null;
  }

  // If within 1 hour of expiry, refresh automatically
  if (expiry && expiry - now <= REFRESH_THRESHOLD_MS && storedRefreshToken) {
    return executeRefresh(storedRefreshToken);
  }

  return jwt;
}

async function executeRefresh(refreshTokenStr: string): Promise<string | null> {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise;
  }

  inFlightRefreshPromise = (async () => {
    try {
      const tokens = await refreshToken(refreshTokenStr);
      useAuthStore
        .getState()
        .applyRefreshedTokens(
          tokens.accessToken,
          tokens.expiresIn,
          tokens.refreshToken
        );
      return tokens.accessToken;
    } catch (error) {
      if (isTokenExpired(useAuthStore.getState().jwt)) {
        useAuthStore.getState().disconnect();
        useAuthStore
          .getState()
          .setError("Session expired. Please reconnect your wallet.");
      }
      return useAuthStore.getState().jwt;
    } finally {
      inFlightRefreshPromise = null;
    }
  })();

  return inFlightRefreshPromise;
}

/**
 * Fetch all active sessions for the authenticated user.
 */
export async function getSessions(
  jwt: string,
  signal?: AbortSignal
): Promise<UserSession[]> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<UserSession[]>("/auth/sessions", token, signal);
  return response.data;
}

/**
 * Revoke an active user session by session ID.
 */
export async function revokeSession(
  jwt: string,
  sessionId: string,
  signal?: AbortSignal
): Promise<{ success: boolean }> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.delete<{ success: boolean }>(
    `/auth/sessions/${sessionId}`,
    token,
    signal
  );
  return response.data;
}

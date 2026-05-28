import { apiClient } from "./client";
import type { AuthTokens, UserProfile } from "@/types/api";

/**
 * Request a challenge message for wallet-based authentication.
 */
export async function getChallenge(walletAddress: string): Promise<string> {
  const response = await apiClient.get<{ challenge: string }>(
    `/auth/challenge?address=${walletAddress}`
  );
  return response.data.challenge;
}

/**
 * Submit a signed challenge to authenticate and receive JWT tokens.
 */
export async function verifySignature(
  walletAddress: string,
  signedChallenge: string
): Promise<AuthTokens> {
  const response = await apiClient.post<AuthTokens>("/auth/verify", {
    walletAddress,
    signedChallenge,
  });
  return response.data;
}

/**
 * Fetch the authenticated user's profile.
 */
export async function getProfile(jwt: string): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>("/auth/profile", jwt);
  return response.data;
}

/**
 * Create or update the user's onboarding profile.
 */
export async function updateProfile(
  jwt: string,
  profile: Partial<UserProfile>
): Promise<UserProfile> {
  const response = await apiClient.put<UserProfile>(
    "/auth/profile",
    profile,
    jwt
  );
  return response.data;
}

/**
 * Refresh an expired access token.
 */
export async function refreshToken(
  refreshToken: string
): Promise<AuthTokens> {
  const response = await apiClient.post<AuthTokens>("/auth/refresh", {
    refreshToken,
  });
  return response.data;
}

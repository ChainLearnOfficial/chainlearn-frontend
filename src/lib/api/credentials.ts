import { apiClient } from "./client";
import type { CredentialNFT, CredentialMetadata } from "@/types/stellar";

/**
 * Fetch all credentials for the authenticated user.
 */
export async function getCredentials(
  jwt: string,
  signal?: AbortSignal
): Promise<CredentialNFT[]> {
  const response = await apiClient.get<CredentialNFT[]>(
    "/credentials",
    jwt,
    signal
  );
  return response.data;
}

/**
 * Fetch a single credential by ID.
 */
export async function getCredential(
  credentialId: string,
  jwt?: string,
  signal?: AbortSignal
): Promise<CredentialNFT> {
  const response = await apiClient.get<CredentialNFT>(
    `/credentials/${credentialId}`,
    jwt,
    signal
  );
  return response.data;
}

/**
 * Verify a credential publicly (no auth required).
 */
export async function verifyCredential(
  credentialId: string,
  signal?: AbortSignal
): Promise<{
  valid: boolean;
  metadata: CredentialMetadata;
  verifiedAt: string;
}> {
  const response = await apiClient.get<{
    valid: boolean;
    metadata: CredentialMetadata;
    verifiedAt: string;
  }>(`/credentials/${credentialId}/verify`, undefined, signal);
  return response.data;
}

/**
 * Mint a credential NFT after course completion.
 */
export async function mintCredential(
  courseId: string,
  jwt: string,
  signal?: AbortSignal
): Promise<CredentialNFT> {
  const response = await apiClient.post<CredentialNFT>(
    "/credentials/mint",
    { courseId },
    jwt,
    signal
  );
  return response.data;
}

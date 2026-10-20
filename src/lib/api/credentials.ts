import { apiClient } from "./client";
import type { CredentialNFT, CredentialMetadata } from "@/types/stellar";

/**
 * Fetch all credentials for the authenticated user.
 */
export async function getCredentials(
  jwt: string
): Promise<CredentialNFT[]> {
  const response = await apiClient.get<CredentialNFT[]>(
    "/credentials",
    jwt
  );
  return response.data;
}

/**
 * Fetch a single credential by ID.
 */
export async function getCredential(
  credentialId: string,
  jwt?: string
): Promise<CredentialNFT> {
  const response = await apiClient.get<CredentialNFT>(
    `/credentials/${credentialId}`,
    jwt
  );
  return response.data;
}

/**
 * Verify a credential publicly (no auth required).
 * #507 — Fix property name: API returns data wrapped in ApiResponse, so we
 * need to extract .data from the response envelope.
 */
export async function verifyCredential(
  credentialId: string
): Promise<{
  valid: boolean;
  metadata: CredentialMetadata;
  verifiedAt: string;
}> {
  const response = await apiClient.get<{
    valid: boolean;
    metadata: CredentialMetadata;
    verifiedAt: string;
  }>(`/credentials/${credentialId}/verify`);
  // ApiResponse wraps data in { data, message?, success }, so extract .data
  return response.data;
}

/**
 * Mint a credential NFT after course completion.
 */
export async function mintCredential(
  courseId: string,
  jwt: string
): Promise<CredentialNFT> {
  const response = await apiClient.post<CredentialNFT>(
    "/credentials/mint",
    { courseId },
    jwt
  );
  return response.data;
}

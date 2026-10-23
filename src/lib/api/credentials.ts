import { apiClient, requireApiData } from "./client";
import { ApiError } from "@/types/api";
import { getValidToken } from "./auth";
import { encodePathParam } from "./path";
import type { CredentialNFT } from "@/types/stellar";

/** Reason a public credential verification did not succeed (issue #309). */
export type VerifyCredentialError = "not_found" | "invalid";

/**
 * Public credential verification result. `valid` is the authoritative
 * yes/no; on success `credential` and `verifiedAt` are populated, on
 * failure `error` names the reason.
 *
 * Kept as an object with optional fields (rather than a strict discriminated
 * union) so callers already reading `result.credential?.metadata` compile
 * with just a `?.` change.
 */
export interface VerifyCredentialResult {
  valid: boolean;
  credential?: CredentialNFT;
  verifiedAt?: string;
  error?: VerifyCredentialError;
}
import { getValidToken } from "./auth";

/**
 * Fetch all credentials for the authenticated user.
 */
export async function getCredentials(
  jwt: string,
  signal?: AbortSignal
): Promise<CredentialNFT[]> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<CredentialNFT[]>(
    "/credentials",
    token,
    signal
  );
  return requireApiData(response.data);
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
    `/credentials/${encodePathParam(credentialId, "credentialId")}`,
    jwt,
    signal
  );
  return requireApiData(response.data);
}

/**
 * Calls `GET /credentials/verify/:id` and returns a typed
 * `VerifyCredentialResult`. A 404 for a nonexistent credential is folded
 * into `{ valid: false, error: "not_found" }` so callers do not have to
 * distinguish "the server said this credential is invalid" from "the
 * server has no record of it" via exception handling (issue #309).
 * Other statuses (5xx, network) still throw so callers can render a
 * retryable state.
 */
export async function verifyCredential(
  credentialId: string,
  signal?: AbortSignal
): Promise<VerifyCredentialResult> {
  try {
    const response = await apiClient.get<VerifyCredentialResult>(
      `/credentials/verify/${encodePathParam(credentialId, "credentialId")}`,
      undefined,
      signal
    );
    return requireApiData(response.data);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { valid: false, error: "not_found" };
    }
    throw err;
  }
}

/**
 * Mint a credential NFT after course completion.
 */
export async function mintCredential(
  courseId: string,
  jwt: string,
  signal?: AbortSignal
): Promise<CredentialNFT> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.post<CredentialNFT>(
    "/credentials/mint",
    { courseId },
    token,
    signal
  );
  return requireApiData(response.data);
}

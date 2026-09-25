import { apiClient } from "./client";
import { getValidToken } from "./auth";
import type { RewardClaim, TokenBalance } from "@/types/stellar";
import type { PaginatedResponse } from "@/types/api";

/** Pagination and filtering parameters for reward history. */
export interface RewardHistoryParams {
  /** Page number (1-indexed). Defaults to 1. */
  page?: number;
  /** Items per page. Defaults to 20. */
  pageSize?: number;
  /** ISO 8601 start date for filtering (inclusive). */
  startDate?: string;
  /** ISO 8601 end date for filtering (inclusive). */
  endDate?: string;
  /** Sort order. Defaults to "desc" (newest first). */
  sortOrder?: "asc" | "desc";
}

/**
 * Fetch the user's token balances.
 */
export async function getTokenBalances(
  jwt: string,
  signal?: AbortSignal
): Promise<TokenBalance[]> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<TokenBalance[]>(
    "/rewards/balances",
    token,
    signal
  );
  return response.data;
}

/**
 * Fetch the user's reward claim history with pagination and date range
 * filtering (#323).
 *
 * @param params - Pagination and filtering options
 * @param jwt - JWT token for authenticated user
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Paginated reward claims with total count
 *
 * @throws {ApiError} When the request fails
 * @throws {Error} When user is not authenticated
 */
export async function getRewardHistory(
  params: RewardHistoryParams | undefined,
  jwt: string,
  signal?: AbortSignal
): Promise<PaginatedResponse<RewardClaim>> {
  const validToken = await getValidToken();
  const token = validToken || jwt;

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const queryString = searchParams.toString();
  const path = `/rewards/history${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<PaginatedResponse<RewardClaim>>(
    path,
    token,
    signal
  );
  return response.data;
}

/**
 * Claim a reward for completing a course or quiz.
 */
export async function claimReward(
  claimableId: string,
  jwt: string,
  signal?: AbortSignal
): Promise<RewardClaim> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.post<RewardClaim>(
    "/rewards/claim",
    { claimableId },
    token,
    signal
  );
  return response.data;
}

/**
 * Fetch claimable rewards (pending rewards not yet claimed).
 */
export async function getClaimables(
  jwt: string,
  signal?: AbortSignal
): Promise<{ id: string; amount: string; source: string; sourceTitle: string }[]> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<
    { id: string; amount: string; source: string; sourceTitle: string }[]
  >("/rewards/claimables", token, signal);
  return response.data;
}

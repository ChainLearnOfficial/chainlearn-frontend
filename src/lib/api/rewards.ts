import { apiClient } from "./client";
import { getValidToken } from "./auth";
import type { PaginatedResponse } from "@/types/api";
import type { RewardClaim, TokenBalance } from "@/types/stellar";

export interface GetRewardHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
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
 * Fetch the user's reward claim history.
 */
export async function getRewardHistory(
  jwt: string,
  params?: GetRewardHistoryParams,
  signal?: AbortSignal
): Promise<PaginatedResponse<RewardClaim>> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  
  const query = searchParams.toString();
  const response = await apiClient.get<PaginatedResponse<RewardClaim>>(
    `/rewards/history${query ? `?${query}` : ""}`,
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

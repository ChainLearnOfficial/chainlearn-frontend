import { apiClient } from "./client";
import { getValidToken } from "./auth";
import type { RewardClaim, TokenBalance } from "@/types/stellar";

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
  signal?: AbortSignal
): Promise<RewardClaim[]> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<RewardClaim[]>(
    "/rewards/history",
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

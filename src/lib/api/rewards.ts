import { apiClient } from "./client";
import type { RewardClaim, TokenBalance } from "@/types/stellar";

/**
 * Fetch the user's token balances.
 */
export async function getTokenBalances(
  jwt: string,
  signal?: AbortSignal
): Promise<TokenBalance[]> {
  const response = await apiClient.get<TokenBalance[]>(
    "/rewards/balances",
    jwt,
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
  const response = await apiClient.get<RewardClaim[]>(
    "/rewards/history",
    jwt,
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
  const response = await apiClient.post<RewardClaim>(
    "/rewards/claim",
    { claimableId },
    jwt,
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
  const response = await apiClient.get<
    { id: string; amount: string; source: string; sourceTitle: string }[]
  >("/rewards/claimables", jwt, signal);
  return response.data;
}

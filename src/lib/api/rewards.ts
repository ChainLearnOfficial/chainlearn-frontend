import { apiClient } from "./client";
import type { RewardClaim, TokenBalance } from "@/types/stellar";

/**
 * Fetch the user's token balances.
 */
export async function getTokenBalances(
  jwt: string
): Promise<TokenBalance[]> {
  const response = await apiClient.get<TokenBalance[]>(
    "/rewards/balances",
    jwt
  );
  return response.data;
}

/**
 * Fetch the user's reward claim history.
 */
export async function getRewardHistory(
  jwt: string
): Promise<RewardClaim[]> {
  const response = await apiClient.get<RewardClaim[]>(
    "/rewards/history",
    jwt
  );
  return response.data;
}

/**
 * Claim a reward for completing a course or quiz.
 */
export async function claimReward(
  claimableId: string,
  jwt: string
): Promise<RewardClaim> {
  const response = await apiClient.post<RewardClaim>(
    "/rewards/claim",
    { claimableId },
    jwt
  );
  return response.data;
}

/**
 * Fetch claimable rewards (pending rewards not yet claimed).
 */
export async function getClaimables(
  jwt: string
): Promise<{ id: string; amount: string; source: string; sourceTitle: string }[]> {
  const response = await apiClient.get<
    { id: string; amount: string; source: string; sourceTitle: string }[]
  >("/rewards/claimables", jwt);
  return response.data;
}

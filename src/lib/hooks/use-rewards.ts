"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  getTokenBalances,
  getRewardHistory,
  claimReward,
  getClaimables,
} from "@/lib/api/rewards";
import type { RewardClaim, TokenBalance } from "@/types/stellar";

export function useRewards() {
  const jwt = useAuthStore((s) => s.jwt);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [history, setHistory] = useState<RewardClaim[]>([]);
  const [claimables, setClaimables] = useState<
    { id: string; amount: string; source: string; sourceTitle: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!jwt) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [bal, hist, claim] = await Promise.all([
        getTokenBalances(jwt),
        getRewardHistory(jwt),
        getClaimables(jwt),
      ]);
      setBalances(bal);
      setHistory(hist);
      setClaimables(claim);
    } catch (err) {
      console.error("Failed to fetch rewards:", err);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  const claim = useCallback(
    async (claimableId: string) => {
      if (!jwt) throw new Error("Not authenticated");
      setClaiming(true);
      try {
        const result = await claimReward(claimableId, jwt);
        setHistory((prev) => [result, ...prev]);
        // Refresh balances and claimables
        const [bal, claim] = await Promise.all([
          getTokenBalances(jwt),
          getClaimables(jwt),
        ]);
        setBalances(bal);
        setClaimables(claim);
        return result;
      } finally {
        setClaiming(false);
      }
    },
    [jwt]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    balances,
    history,
    claimables,
    loading,
    claiming,
    claim,
    refetch: fetchAll,
  };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  getTokenBalances,
  getRewardHistory,
  claimReward,
  getClaimables,
} from "@/lib/api/rewards";
import type { RewardHistoryParams } from "@/lib/api/rewards";
import { isAbortError } from "@/lib/api/client";
import type { RewardClaim, TokenBalance } from "@/types/stellar";
import type { PaginatedResponse } from "@/types/api";

const CACHE_TTL_MS = 60_000;

interface RewardsCache {
  balances: TokenBalance[];
  history: PaginatedResponse<RewardClaim>;
  claimables: { id: string; amount: string; source: string; sourceTitle: string }[];
  fetchedAt: number;
}

const rewardsCache = new Map<string, RewardsCache>();
const inFlight = new Map<string, Promise<void>>();

async function loadRewards(
  jwt: string,
  signal?: AbortSignal,
  historyParams?: RewardHistoryParams
): Promise<void> {
  const cached = rewardsCache.get(jwt);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS && !historyParams) return;

  const cacheKey = historyParams
    ? `${jwt}:${JSON.stringify(historyParams)}`
    : jwt;
  if (historyParams) {
    const existing = inFlight.get(cacheKey);
    if (existing) {
      await existing;
      return;
    }
  } else {
    const existing = inFlight.get(jwt);
    if (existing) {
      await existing;
      return;
    }
  }

  const request = loadFromApi(jwt, signal, historyParams).finally(() => {
    inFlight.delete(historyParams ? `${jwt}:${JSON.stringify(historyParams)}` : jwt);
  });
  inFlight.set(historyParams ? `${jwt}:${JSON.stringify(historyParams)}` : jwt, request);
  await request;
}

async function loadFromApi(
  jwt: string,
  signal?: AbortSignal,
  historyParams?: RewardHistoryParams
): Promise<void> {
  const [bal, hist, claim] = await Promise.all([
    getTokenBalances(jwt, signal),
    getRewardHistory(historyParams, jwt, signal),
    getClaimables(jwt, signal),
  ]);
  rewardsCache.set(jwt, {
    balances: bal,
    history: hist,
    claimables: claim,
    fetchedAt: Date.now(),
  });
}

function invalidateCache(jwt: string) {
  rewardsCache.delete(jwt);
}

export function useRewards() {
  const jwt = useAuthStore((s) => s.jwt);
  const jwtRef = useRef(jwt);
  jwtRef.current = jwt;
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [history, setHistory] = useState<PaginatedResponse<RewardClaim>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false,
  });
  const [claimables, setClaimables] = useState<
    { id: string; amount: string; source: string; sourceTitle: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async (historyParams?: RewardHistoryParams) => {
    const token = jwtRef.current;
    if (!token) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      await loadRewards(token, controller.signal, historyParams);
      const cached = rewardsCache.get(token);
      if (cached) {
        setBalances(cached.balances);
        setHistory(cached.history);
        setClaimables(cached.claimables);
      }
    } catch (e) {
      if (isAbortError(e)) return;
      console.error("Failed to fetch rewards:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const claim = useCallback(
    async (claimableId: string) => {
      const token = jwtRef.current;
      if (!token) throw new Error("Not authenticated");
      setClaiming(true);
      setError(null);
      try {
        const result = await claimReward(claimableId, token);
        invalidateCache(token);
        setHistory((prev) => ({
          ...prev,
          data: [result, ...prev.data],
          total: prev.total + 1,
        }));
        // Refresh balances and claimables
        await loadRewards(token);
        const cached = rewardsCache.get(token);
        if (cached) {
          setBalances(cached.balances);
          setClaimables(cached.claimables);
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to claim reward";
        setError(message);
        throw err;
      } finally {
        setClaiming(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAll();
    return () => abortRef.current?.abort();
  }, [fetchAll]);

  return {
    balances,
    history,
    claimables,
    loading,
    claiming,
    error,
    claim,
    refetch: fetchAll,
  };
}

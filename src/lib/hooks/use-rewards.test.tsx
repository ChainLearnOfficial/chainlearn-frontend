import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRewards } from "./use-rewards";
import { useAuthStore } from "@/store/auth-store";

// Mock API modules
vi.mock("@/lib/api/rewards", () => ({
  getTokenBalances: vi.fn(),
  getRewardHistory: vi.fn(),
  claimReward: vi.fn(),
  getClaimables: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  isAbortError: vi.fn((err) => err?.name === "AbortError"),
}));

describe("useRewards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ jwt: null });
  });

  it("should initialize with empty data when not authenticated", () => {
    const { result } = renderHook(() => useRewards());
    
    expect(result.current.balances).toEqual([]);
    expect(result.current.history.data).toEqual([]);
    expect(result.current.claimables).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("should fetch rewards when authenticated", async () => {
    const mockBalances = [{ token: "XLM", balance: "100" }];
    const mockHistory = { data: [], total: 0, page: 1, pageSize: 20, hasMore: false };
    const mockClaimables = [{ id: "claim-1", amount: "10" }];
    
    const { getTokenBalances, getRewardHistory, getClaimables } = await import("@/lib/api/rewards");
    vi.mocked(getTokenBalances).mockResolvedValue(mockBalances as any);
    vi.mocked(getRewardHistory).mockResolvedValue(mockHistory as any);
    vi.mocked(getClaimables).mockResolvedValue(mockClaimables as any);
    
    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useRewards());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle claim reward", async () => {
    const mockClaim = { id: "claim-1", amount: "10" };
    const { claimReward } = await import("@/lib/api/rewards");
    vi.mocked(claimReward).mockResolvedValue(mockClaim as any);
    
    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useRewards());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    await act(async () => {
      await result.current.claim("claim-1");
    });
    
    expect(claimReward).toHaveBeenCalled();
  });

  it("should handle claim reward error", async () => {
    const { claimReward } = await import("@/lib/api/rewards");
    vi.mocked(claimReward).mockRejectedValue(new Error("Claim failed"));
    
    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useRewards());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    await expect(async () => {
      await result.current.claim("claim-1");
    }).rejects.toThrow();
  });

  it("should set claiming state during claim", async () => {
    const { claimReward } = await import("@/lib/api/rewards");
    let resolveClaim: any;
    vi.mocked(claimReward).mockImplementation(() => new Promise((resolve) => {
      resolveClaim = resolve;
    }));
    
    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useRewards());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    const claimPromise = act(async () => {
      await result.current.claim("claim-1");
    });
    
    expect(result.current.claiming).toBe(true);
    
    resolveClaim({ id: "claim-1" });
    await claimPromise;
    
    expect(result.current.claiming).toBe(false);
  });
});

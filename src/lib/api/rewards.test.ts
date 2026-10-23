import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTokenBalances,
  getRewardHistory,
  claimReward,
  getClaimables,
} from "./rewards";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from "./client";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("rewards API", () => {
  describe("getTokenBalances", () => {
    it("fetches token balances", async () => {
      const balances = [{ tokenCode: "LEARN", balance: "100", decimals: 7 }];
      mockGet.mockResolvedValue({ data: balances, success: true });
      const result = await getTokenBalances("jwt");
      expect(result).toEqual(balances);
      expect(mockGet).toHaveBeenCalledWith("/rewards/balances", "jwt");
    });

    it("throws on API error", async () => {
      mockGet.mockRejectedValue(new Error("unauthorized"));
      await expect(getTokenBalances("bad")).rejects.toThrow();
    });
  });

  describe("getRewardHistory", () => {
    it("fetches claim history", async () => {
      const history = [{ id: "1", txHash: "abc", amount: "10", tokenCode: "LEARN", claimedAt: "2026-01-01", status: "confirmed" }];
      mockGet.mockResolvedValue({ data: history, success: true });
      const result = await getRewardHistory("jwt");
      expect(result).toEqual(history);
      expect(mockGet).toHaveBeenCalledWith("/rewards/history", "jwt");
    });

    it("throws on API error", async () => {
      mockGet.mockRejectedValue(new Error("unauthorized"));
      await expect(getRewardHistory("bad")).rejects.toThrow();
    });
  });

  describe("claimReward", () => {
    it("claims a reward and returns claim record", async () => {
      const claim = { id: "1", txHash: "abc", amount: "10", tokenCode: "LEARN", claimedAt: "2026-01-01", status: "pending" };
      mockPost.mockResolvedValue({ data: claim, success: true });
      const result = await claimReward("claimable-1", "jwt");
      expect(result).toEqual(claim);
      expect(mockPost).toHaveBeenCalledWith("/rewards/claim", { claimableId: "claimable-1" }, "jwt");
    });

    it("throws on invalid claimable", async () => {
      mockPost.mockRejectedValue(new Error("not found"));
      await expect(claimReward("bad", "jwt")).rejects.toThrow();
    });
  });

  describe("getClaimables", () => {
    it("fetches pending claimable rewards", async () => {
      const claimables = [{ id: "1", amount: "50", source: "quiz", sourceTitle: "Intro Quiz" }];
      mockGet.mockResolvedValue({ data: claimables, success: true });
      const result = await getClaimables("jwt");
      expect(result).toEqual(claimables);
      expect(mockGet).toHaveBeenCalledWith("/rewards/claimables", "jwt");
    });

    it("throws on API error", async () => {
      mockGet.mockRejectedValue(new Error("unauthorized"));
      await expect(getClaimables("bad")).rejects.toThrow();
    });
  });
});

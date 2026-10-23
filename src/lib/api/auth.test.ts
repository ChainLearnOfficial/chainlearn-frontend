import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getChallenge,
  verifySignature,
  getProfile,
  updateProfile,
  refreshToken,
} from "./auth";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "./client";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth API", () => {
  describe("getChallenge", () => {
    it("fetches a challenge for a wallet address", async () => {
      mockGet.mockResolvedValue({ data: { challenge: "abc123" }, success: true });
      const result = await getChallenge("GABC");
      expect(result).toBe("abc123");
      expect(mockGet).toHaveBeenCalledWith("/auth/challenge?address=GABC");
    });

    it("throws on API error", async () => {
      mockGet.mockRejectedValue(new Error("network"));
      await expect(getChallenge("GABC")).rejects.toThrow("network");
    });
  });

  describe("verifySignature", () => {
    it("submits signed challenge and returns tokens", async () => {
      const tokens = { accessToken: "at", refreshToken: "rt", expiresIn: 3600 };
      mockPost.mockResolvedValue({ data: tokens, success: true });
      const result = await verifySignature("GABC", "sig");
      expect(result).toEqual(tokens);
      expect(mockPost).toHaveBeenCalledWith("/auth/verify", {
        walletAddress: "GABC",
        signedChallenge: "sig",
      });
    });

    it("throws on invalid signature", async () => {
      mockPost.mockRejectedValue(new Error("invalid signature"));
      await expect(verifySignature("GABC", "bad")).rejects.toThrow();
    });
  });

  describe("getProfile", () => {
    it("fetches profile with JWT", async () => {
      const profile = { id: "1", walletAddress: "GABC" };
      mockGet.mockResolvedValue({ data: profile, success: true });
      const result = await getProfile("jwt-token");
      expect(result).toEqual(profile);
      expect(mockGet).toHaveBeenCalledWith("/auth/profile", "jwt-token");
    });

    it("throws on unauthorized", async () => {
      mockGet.mockRejectedValue(new Error("401"));
      await expect(getProfile("bad")).rejects.toThrow();
    });
  });

  describe("updateProfile", () => {
    it("updates profile with PUT", async () => {
      const updated = { id: "1", displayName: "New Name" };
      mockPut.mockResolvedValue({ data: updated, success: true });
      const result = await updateProfile("jwt", { displayName: "New Name" });
      expect(result).toEqual(updated);
      expect(mockPut).toHaveBeenCalledWith(
        "/auth/profile",
        { displayName: "New Name" },
        "jwt"
      );
    });

    it("throws on API error", async () => {
      mockPut.mockRejectedValue(new Error("bad request"));
      await expect(updateProfile("jwt", {})).rejects.toThrow();
    });
  });

  describe("refreshToken", () => {
    it("refreshes tokens with refresh token", async () => {
      const tokens = { accessToken: "new", refreshToken: "newRt", expiresIn: 3600 };
      mockPost.mockResolvedValue({ data: tokens, success: true });
      const result = await refreshToken("old-rt");
      expect(result).toEqual(tokens);
      expect(mockPost).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken: "old-rt",
      });
    });

    it("throws on expired refresh token", async () => {
      mockPost.mockRejectedValue(new Error("expired"));
      await expect(refreshToken("expired")).rejects.toThrow();
    });
  });
});

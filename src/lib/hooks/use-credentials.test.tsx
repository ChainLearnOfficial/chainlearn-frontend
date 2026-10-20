import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCredentials, useCredentialDetail, useVerifyCredential } from "./use-credentials";
import { useAuthStore } from "@/store/auth-store";

// Mock API modules
vi.mock("@/lib/api/credentials", () => ({
  getCredentials: vi.fn(),
  getCredential: vi.fn(),
  verifyCredential: vi.fn(),
  mintCredential: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  isAbortError: vi.fn((err) => err?.name === "AbortError"),
}));

describe("useCredentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ jwt: null });
  });

  it("should initialize with empty credentials when not authenticated", () => {
    const { result } = renderHook(() => useCredentials());
    
    expect(result.current.credentials).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("should fetch credentials when authenticated", async () => {
    const mockCredentials = [
      { id: "cred-1", courseId: "course-1", issuedAt: "2024-01-01" },
    ];
    const { getCredentials } = await import("@/lib/api/credentials");
    vi.mocked(getCredentials).mockResolvedValue(mockCredentials as any);
    
    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useCredentials());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle mint credential", async () => {
    const { mintCredential } = await import("@/lib/api/credentials");
    vi.mocked(mintCredential).mockResolvedValue({ id: "new-cred" } as any);
    
    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useCredentials());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    await act(async () => {
      await result.current.mint("course-1");
    });
    
    expect(mintCredential).toHaveBeenCalled();
  });

  it("should handle mint credential error", async () => {
    const { mintCredential } = await import("@/lib/api/credentials");
    vi.mocked(mintCredential).mockRejectedValue(new Error("Failed to mint"));
    
    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useCredentials());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    await expect(async () => {
      await result.current.mint("course-1");
    }).rejects.toThrow();
  });
});

describe("useCredentialDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ jwt: null });
  });

  it("should fetch credential detail", async () => {
    const mockCredential = { id: "cred-1", courseId: "course-1" };
    const { getCredential } = await import("@/lib/api/credentials");
    vi.mocked(getCredential).mockResolvedValue(mockCredential as any);
    
    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useCredentialDetail("cred-1"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle missing credential id", () => {
    const { result } = renderHook(() => useCredentialDetail(""));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.credential).toBe(null);
  });
});

describe("useVerifyCredential", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should verify credential", async () => {
    const mockVerification = { valid: true, issuer: "test" };
    const { verifyCredential } = await import("@/lib/api/credentials");
    vi.mocked(verifyCredential).mockResolvedValue(mockVerification as any);
    
    const { result } = renderHook(() => useVerifyCredential("cred-1"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle verification error", async () => {
    const { verifyCredential } = await import("@/lib/api/credentials");
    vi.mocked(verifyCredential).mockRejectedValue(new Error("Verification failed"));
    
    const { result } = renderHook(() => useVerifyCredential("cred-1"));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyCredential } from "./credentials";
import { useErrorStore } from "@/store/error-store";
import type { CredentialNFT } from "@/types/stellar";

// Same localStorage shim as client.test.ts: zustand's persist middleware
// writes on every set(); jsdom's default localStorage is not usable when the
// auth store module loads, so install a working one before then.
vi.hoisted(() => {
  const map = new Map<string, string>();
  const storage = {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    writable: true,
    configurable: true,
  });
});

const fetchMock = vi.fn();

beforeEach(() => {
  vi.useRealTimers();
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  useErrorStore.getState().clearError();
});

afterEach(() => {
  vi.useRealTimers();
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const SAMPLE_CREDENTIAL: CredentialNFT = {
  id: "cred-abc",
  tokenId: "1",
  contractAddress: "C-contract",
  courseId: "course-1",
  courseTitle: "Intro to Stellar",
  issuedAt: "2026-09-01T00:00:00.000Z",
  metadata: {
    learnerAddress: "GABC",
    courseTitle: "Intro to Stellar",
    completionDate: "2026-08-31T00:00:00.000Z",
    skills: ["stellar", "smart-contracts"],
    issuerAddress: "GISSUER",
    verificationUrl: "https://example.com/verify/cred-abc",
  },
};

describe("verifyCredential", () => {
  it("returns a valid result with credential details when the API confirms verification", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          valid: true,
          credential: SAMPLE_CREDENTIAL,
          verifiedAt: "2026-09-25T10:00:00.000Z",
        },
        success: true,
      })
    );

    const result = await verifyCredential("cred-abc");

    expect(result).toEqual({
      valid: true,
      credential: SAMPLE_CREDENTIAL,
      verifiedAt: "2026-09-25T10:00:00.000Z",
    });
    // Public verification: no Authorization header should be sent.
    const call = fetchMock.mock.calls[0];
    const init = call[1] as RequestInit;
    const headers = init.headers as Record<string, string> | undefined;
    expect(headers?.Authorization ?? headers?.authorization).toBeUndefined();
    // URL shape: /credentials/verify/:id (not /credentials/:id/verify).
    const url = String(call[0]);
    expect(url).toMatch(/\/credentials\/verify\/cred-abc$/);
  });

  it("returns { valid: false, error: 'not_found' } on 404 without throwing", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "Credential not found" }, 404)
    );

    const result = await verifyCredential("does-not-exist");

    expect(result).toEqual({ valid: false, error: "not_found" });
  });

  it("throws ApiError for 5xx server errors (retryable path)", async () => {
    // apiClient retries 5xx up to 3 times before giving up; using fake timers
    // so we do not sit through the exponential backoff. Fresh id per test so
    // the 60s response cache does not smuggle the valid result across tests.
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 500));

    const request = verifyCredential("cred-500");
    // Attach the rejection handler before advancing timers so the rejection
    // is not reported as unhandled.
    const assertion = expect(request).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
    });
    await vi.runAllTimersAsync();
    await assertion;

    // Initial + 3 retries.
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});

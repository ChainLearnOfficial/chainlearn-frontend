import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient, isAbortError } from "./client";
import { useErrorStore } from "@/store/error-store";

// zustand's persist middleware writes on every set(); jsdom's localStorage is
// not usable here, so install a working one before the auth store module loads.
vi.hoisted(() => {
  const map = new Map<string, string>();
  const storage = {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => { map.delete(key); },
    setItem: (key: string, value: string) => { map.set(key, value); },
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

/** fetch mock that rejects with an AbortError once the passed signal fires. */
function abortableFetch() {
  fetchMock.mockImplementation(
    (_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      })
  );
}

describe("apiClient abort support", () => {
  it("rejects with AbortError when an already-aborted signal is passed", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      apiClient.get("/courses", undefined, controller.signal)
    ).rejects.toMatchObject({ name: "AbortError" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useErrorStore.getState().error).toBeNull();
  });

  it("aborts an in-flight request when the signal fires", async () => {
    abortableFetch();
    const controller = new AbortController();

    const request = apiClient.get("/courses", undefined, controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(useErrorStore.getState().error).toBeNull();
  });

  it("does not retry a manually aborted request", async () => {
    abortableFetch();
    const controller = new AbortController();

    // get() is configured with 3 retries; an external abort must never retry.
    const request = apiClient.get("/courses", undefined, controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not surface aborted requests in the error store", async () => {
    abortableFetch();
    const controller = new AbortController();

    const request = apiClient.post("/courses/1/enroll", {}, "jwt", controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(useErrorStore.getState().error).toBeNull();
  });

  it("exposes isAbortError for consumers to skip post-abort handling", async () => {
    abortableFetch();
    const controller = new AbortController();

    const request = apiClient.get("/courses", undefined, controller.signal);
    controller.abort();

    try {
      await request;
      expect.unreachable("expected the request to reject");
    } catch (err) {
      expect(isAbortError(err)).toBe(true);
    }
  });

  it("preserves TIMEOUT behaviour when retries are exhausted", async () => {
    vi.useFakeTimers();
    // Simulate the internal timeout abort: fetch rejects with an AbortError
    // while no external signal is aborted.
    fetchMock.mockRejectedValue(
      new DOMException("The operation was aborted.", "AbortError")
    );

    const request = apiClient.get("/courses");
    // Attach the rejection handler before advancing timers so the timeout
    // ApiError is not reported as an unhandled rejection.
    const assertion = expect(request).rejects.toMatchObject({
      name: "ApiError",
      code: "TIMEOUT",
    });
    await vi.runAllTimersAsync();
    await assertion;

    expect(fetchMock).toHaveBeenCalledTimes(4); // initial + 3 retries
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe("apiClient request deduplication", () => {
  it("shares one in-flight request across concurrent callers", async () => {
    let resolveFetch!: (r: Response) => void;
    fetchMock.mockImplementation(
      () => new Promise<Response>((resolve) => { resolveFetch = resolve; })
    );

    const a = apiClient.get("/dedupe/a");
    const b = apiClient.get("/dedupe/a");
    resolveFetch(jsonResponse({ data: "shared" }));

    await expect(a).resolves.toEqual({ data: "shared" });
    await expect(b).resolves.toEqual({ data: "shared" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not share requests for different URLs", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: "x" }));

    await Promise.all([
      apiClient.get("/dedupe/b"),
      apiClient.get("/dedupe/c"),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("issues a fresh request once the shared one has completed", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: "y" }));

    await apiClient.get("/dedupe/d", undefined, undefined, { bypassCache: true });
    await apiClient.get("/dedupe/d", undefined, undefined, { bypassCache: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps the shared request alive when one of several callers aborts", async () => {
    let resolveFetch!: (r: Response) => void;
    fetchMock.mockImplementation(
      () => new Promise<Response>((resolve) => { resolveFetch = resolve; })
    );

    const controller = new AbortController();
    const aborted = apiClient.get("/dedupe/e", undefined, controller.signal);
    const kept = apiClient.get("/dedupe/e");

    controller.abort();
    await expect(aborted).rejects.toMatchObject({ name: "AbortError" });

    resolveFetch(jsonResponse({ data: "still-here" }));
    await expect(kept).resolves.toEqual({ data: "still-here" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

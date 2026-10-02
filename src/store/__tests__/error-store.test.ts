import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useErrorStore, type ApiErrorState } from "../error-store";
import { ApiError } from "@/types/api";

describe("useErrorStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useErrorStore.setState({
      error: null,
      isTransient: false,
      retry: undefined,
    });
  });

  afterEach(() => {
    // Clean up after each test
    useErrorStore.setState({
      error: null,
      isTransient: false,
      retry: undefined,
    });
  });

  describe("setError", () => {
    it("should set error with default isTransient to false", () => {
      const store = useErrorStore.getState();
      const mockError = new ApiError(400, "Test error", "TEST_ERROR");

      store.setError(mockError);

      expect(store.error).toEqual(mockError);
      expect(store.isTransient).toBe(false);
    });

    it("should set error with isTransient to true", () => {
      const store = useErrorStore.getState();
      const mockError = new ApiError(503, "Transient error", "TRANSIENT_ERROR");

      store.setError(mockError, true);

      expect(store.error).toEqual(mockError);
      expect(store.isTransient).toBe(true);
    });

    it("should set error to null", () => {
      const store = useErrorStore.getState();
      const mockError = new ApiError(400, "Test error", "TEST_ERROR");
      store.setError(mockError);

      store.setError(null);

      expect(store.error).toBe(null);
    });

    it("should update isTransient when setting new error", () => {
      const store = useErrorStore.getState();
      const mockError1 = new ApiError(400, "First error", "FIRST_ERROR");
      const mockError2 = new ApiError(500, "Second error", "SECOND_ERROR");

      store.setError(mockError1, true);
      expect(store.isTransient).toBe(true);

      store.setError(mockError2, false);
      expect(store.isTransient).toBe(false);
    });
  });

  describe("clearError", () => {
    it("should clear error and set isTransient to false", () => {
      const store = useErrorStore.getState();
      const mockError = new ApiError(400, "Test error", "TEST_ERROR");
      store.setError(mockError, true);

      store.clearError();

      expect(store.error).toBe(null);
      expect(store.isTransient).toBe(false);
    });

    it("should work when error is already null", () => {
      const store = useErrorStore.getState();

      expect(() => store.clearError()).not.toThrow();
      expect(store.error).toBe(null);
      expect(store.isTransient).toBe(false);
    });
  });

  describe("setRetry", () => {
    it("should set retry callback", () => {
      const store = useErrorStore.getState();
      const mockRetry = async () => {
        console.log("Retrying...");
      };

      store.setRetry(mockRetry);

      expect(store.retry).toBe(mockRetry);
    });

    it("should set retry to undefined", () => {
      const store = useErrorStore.getState();
      const mockRetry = async () => {
        console.log("Retrying...");
      };
      store.setRetry(mockRetry);

      store.setRetry(undefined);

      expect(store.retry).toBe(undefined);
    });
  });

  describe("error state management", () => {
    it("should initialize with null error and false isTransient", () => {
      const store = useErrorStore.getState();

      expect(store.error).toBe(null);
      expect(store.isTransient).toBe(false);
      expect(store.retry).toBe(undefined);
    });

    it("should allow setting and clearing error multiple times", () => {
      const store = useErrorStore.getState();
      const mockError1 = new ApiError(400, "First error", "FIRST_ERROR");
      const mockError2 = new ApiError(500, "Second error", "SECOND_ERROR");

      store.setError(mockError1);
      expect(store.error).toEqual(mockError1);

      store.clearError();
      expect(store.error).toBe(null);

      store.setError(mockError2);
      expect(store.error).toEqual(mockError2);

      store.clearError();
      expect(store.error).toBe(null);
    });
  });

  describe("retry callback", () => {
    it("should store and execute retry callback", async () => {
      const store = useErrorStore.getState();
      let retryCalled = false;
      const mockRetry = async () => {
        retryCalled = true;
      };

      store.setRetry(mockRetry);

      await store.retry?.();

      expect(retryCalled).toBe(true);
    });

    it("should handle retry callback being undefined", async () => {
      const store = useErrorStore.getState();

      expect(store.retry).toBe(undefined);

      // Should not throw when retry is undefined
      await expect(async () => {
        await store.retry?.();
      }).resolves.not.toThrow();
    });
  });

  describe("transient error flag", () => {
    it("should distinguish between transient and non-transient errors", () => {
      const store = useErrorStore.getState();
      const transientError = new ApiError(504, "Network timeout", "TIMEOUT");
      const permanentError = new ApiError(404, "Not found", "NOT_FOUND");

      store.setError(transientError, true);
      expect(store.isTransient).toBe(true);

      store.setError(permanentError, false);
      expect(store.isTransient).toBe(false);
    });

    it("should reset isTransient when error is cleared", () => {
      const store = useErrorStore.getState();
      const mockError = new ApiError(400, "Test error", "TEST_ERROR");

      store.setError(mockError, true);
      expect(store.isTransient).toBe(true);

      store.clearError();
      expect(store.isTransient).toBe(false);
    });
  });
});

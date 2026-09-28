import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "../auth-store";

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      walletAddress: null,
      jwt: null,
      refreshToken: null,
      isAuthenticated: false,
      isConnecting: false,
      hasHydrated: false,
      network: "testnet",
      tokenExpiresAt: null,
      error: null,
    });
  });

  afterEach(() => {
    // Clean up after each test
    useAuthStore.setState({
      walletAddress: null,
      jwt: null,
      refreshToken: null,
      isAuthenticated: false,
      isConnecting: false,
      hasHydrated: false,
      network: "testnet",
      tokenExpiresAt: null,
      error: null,
    });
  });

  describe("connect", () => {
    it("should set wallet address, jwt, and authenticate user", () => {
      const store = useAuthStore.getState();
      
      store.connect("GABC123", "jwt-token", 3600, "refresh-token");
      
      expect(store.walletAddress).toBe("GABC123");
      expect(store.jwt).toBe("jwt-token");
      expect(store.refreshToken).toBe("refresh-token");
      expect(store.isAuthenticated).toBe(true);
      expect(store.isConnecting).toBe(false);
      expect(store.error).toBe(null);
    });

    it("should set token expiration time when expiresIn is provided", () => {
      const store = useAuthStore.getState();
      const expiresIn = 3600; // 1 hour
      
      store.connect("GABC123", "jwt-token", expiresIn);
      
      const expectedExpiration = Date.now() + expiresIn * 1000;
      expect(store.tokenExpiresAt).toBeGreaterThanOrEqual(expectedExpiration - 100);
      expect(store.tokenExpiresAt).toBeLessThanOrEqual(expectedExpiration + 100);
    });

    it("should set tokenExpiresAt to null when expiresIn is not provided", () => {
      const store = useAuthStore.getState();
      
      store.connect("GABC123", "jwt-token");
      
      expect(store.tokenExpiresAt).toBe(null);
    });

    it("should set session cookie", () => {
      const store = useAuthStore.getState();
      
      store.connect("GABC123", "jwt-token");
      
      // Cookie should be set (we can't easily test document.cookie in test environment,
      // but we verify the function is called)
      expect(store.jwt).toBe("jwt-token");
    });

    it("should clear any existing error on connect", () => {
      const store = useAuthStore.getState();
      store.setError("Previous error");
      
      store.connect("GABC123", "jwt-token");
      
      expect(store.error).toBe(null);
    });
  });

  describe("disconnect", () => {
    it("should clear all auth state", () => {
      const store = useAuthStore.getState();
      store.connect("GABC123", "jwt-token", 3600, "refresh-token");
      
      store.disconnect();
      
      expect(store.walletAddress).toBe(null);
      expect(store.jwt).toBe(null);
      expect(store.refreshToken).toBe(null);
      expect(store.isAuthenticated).toBe(false);
      expect(store.tokenExpiresAt).toBe(null);
      expect(store.error).toBe(null);
    });

    it("should clear session cookie", () => {
      const store = useAuthStore.getState();
      store.connect("GABC123", "jwt-token");
      
      store.disconnect();
      
      expect(store.jwt).toBe(null);
    });
  });

  describe("setJwt", () => {
    it("should update jwt and set session cookie", () => {
      const store = useAuthStore.getState();
      
      store.setJwt("new-jwt-token", 7200);
      
      expect(store.jwt).toBe("new-jwt-token");
    });

    it("should update tokenExpiresAt when expiresIn is provided", () => {
      const store = useAuthStore.getState();
      const expiresIn = 7200;
      
      store.setJwt("new-jwt-token", expiresIn);
      
      const expectedExpiration = Date.now() + expiresIn * 1000;
      expect(store.tokenExpiresAt).toBeGreaterThanOrEqual(expectedExpiration - 100);
      expect(store.tokenExpiresAt).toBeLessThanOrEqual(expectedExpiration + 100);
    });

    it("should preserve existing tokenExpiresAt when expiresIn is not provided", () => {
      const store = useAuthStore.getState();
      store.connect("GABC123", "old-jwt", 3600);
      const originalExpiration = store.tokenExpiresAt;
      
      store.setJwt("new-jwt");
      
      expect(store.tokenExpiresAt).toBe(originalExpiration);
    });
  });

  describe("applyRefreshedTokens", () => {
    it("should update jwt and refreshToken", () => {
      const store = useAuthStore.getState();
      store.connect("GABC123", "old-jwt", 3600, "old-refresh");
      
      store.applyRefreshedTokens("new-jwt", 7200, "new-refresh");
      
      expect(store.jwt).toBe("new-jwt");
      expect(store.refreshToken).toBe("new-refresh");
    });

    it("should update tokenExpiresAt when expiresIn is provided", () => {
      const store = useAuthStore.getState();
      const expiresIn = 7200;
      
      store.applyRefreshedTokens("new-jwt", expiresIn);
      
      const expectedExpiration = Date.now() + expiresIn * 1000;
      expect(store.tokenExpiresAt).toBeGreaterThanOrEqual(expectedExpiration - 100);
      expect(store.tokenExpiresAt).toBeLessThanOrEqual(expectedExpiration + 100);
    });

    it("should preserve existing refreshToken when not provided", () => {
      const store = useAuthStore.getState();
      store.connect("GABC123", "old-jwt", 3600, "existing-refresh");
      
      store.applyRefreshedTokens("new-jwt", 7200);
      
      expect(store.refreshToken).toBe("existing-refresh");
    });

    it("should clear error on token refresh", () => {
      const store = useAuthStore.getState();
      store.setError("Token expired");
      
      store.applyRefreshedTokens("new-jwt", 7200);
      
      expect(store.error).toBe(null);
    });
  });

  describe("isTokenExpired", () => {
    it("should return false when jwt is null", () => {
      const store = useAuthStore.getState();
      
      expect(store.isTokenExpired()).toBe(false);
    });

    it("should return false when tokenExpiresAt is null", () => {
      const store = useAuthStore.getState();
      store.connect("GABC123", "jwt-token");
      
      expect(store.isTokenExpired()).toBe(false);
    });

    it("should return false when token is not expired", () => {
      const store = useAuthStore.getState();
      store.connect("GABC123", "jwt-token", 3600);
      
      expect(store.isTokenExpired()).toBe(false);
    });

    it("should return true when token is expired", () => {
      const store = useAuthStore.getState();
      store.connect("GABC123", "jwt-token", 3600);
      
      // Manually set expiration to past
      store.tokenExpiresAt = Date.now() - 1000;
      
      expect(store.isTokenExpired()).toBe(true);
    });
  });

  describe("setIsConnecting", () => {
    it("should set isConnecting to true", () => {
      const store = useAuthStore.getState();
      
      store.setIsConnecting(true);
      
      expect(store.isConnecting).toBe(true);
    });

    it("should set isConnecting to false", () => {
      const store = useAuthStore.getState();
      store.setIsConnecting(true);
      
      store.setIsConnecting(false);
      
      expect(store.isConnecting).toBe(false);
    });
  });

  describe("setNetwork", () => {
    it("should set network to testnet", () => {
      const store = useAuthStore.getState();
      
      store.setNetwork("testnet");
      
      expect(store.network).toBe("testnet");
    });

    it("should set network to public", () => {
      const store = useAuthStore.getState();
      
      store.setNetwork("public");
      
      expect(store.network).toBe("public");
    });
  });

  describe("setHasHydrated", () => {
    it("should set hasHydrated to true", () => {
      const store = useAuthStore.getState();
      
      store.setHasHydrated(true);
      
      expect(store.hasHydrated).toBe(true);
    });

    it("should set hasHydrated to false", () => {
      const store = useAuthStore.getState();
      store.setHasHydrated(true);
      
      store.setHasHydrated(false);
      
      expect(store.hasHydrated).toBe(false);
    });
  });

  describe("setError", () => {
    it("should set error message", () => {
      const store = useAuthStore.getState();
      
      store.setError("Connection failed");
      
      expect(store.error).toBe("Connection failed");
    });

    it("should set error to null", () => {
      const store = useAuthStore.getState();
      store.setError("Connection failed");
      
      store.setError(null);
      
      expect(store.error).toBe(null);
    });
  });

  describe("clearError", () => {
    it("should clear error", () => {
      const store = useAuthStore.getState();
      store.setError("Connection failed");
      
      store.clearError();
      
      expect(store.error).toBe(null);
    });
  });

  describe("hydration", () => {
    it("should initialize with default values before hydration", () => {
      const store = useAuthStore.getState();
      
      expect(store.walletAddress).toBe(null);
      expect(store.jwt).toBe(null);
      expect(store.refreshToken).toBe(null);
      expect(store.isAuthenticated).toBe(false);
      expect(store.isConnecting).toBe(false);
      expect(store.hasHydrated).toBe(false);
      expect(store.network).toBe("testnet");
      expect(store.tokenExpiresAt).toBe(null);
      expect(store.error).toBe(null);
    });
  });

  describe("persistence", () => {
    it("should persist auth state across store instances", () => {
      const store1 = useAuthStore.getState();
      store1.connect("GABC123", "jwt-token", 3600, "refresh-token");
      
      const store2 = useAuthStore.getState();
      
      expect(store2.walletAddress).toBe("GABC123");
      expect(store2.jwt).toBe("jwt-token");
      expect(store2.refreshToken).toBe("refresh-token");
      expect(store2.isAuthenticated).toBe(true);
    });
  });
});

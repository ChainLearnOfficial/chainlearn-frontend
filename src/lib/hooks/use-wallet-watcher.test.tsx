import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/store/auth-store";
import type { WalletChange } from "@/lib/stellar/wallet";
import { useWalletWatcher } from "./use-wallet-watcher";

// zustand's persist middleware writes on every set(); jsdom's localStorage is
// not usable here, so install a working one before the store module loads.
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

const wallet = vi.hoisted(() => ({
  stop: vi.fn(),
  watchWalletChanges: vi.fn(),
  emit: undefined as undefined | ((change: WalletChange) => void),
}));

vi.mock("@/lib/stellar/wallet", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stellar/wallet")>();
  return {
    ...actual,
    // Capture the callback so tests can simulate Freighter reporting a change.
    watchWalletChanges: wallet.watchWalletChanges.mockImplementation(
      (onChange: (change: WalletChange) => void) => {
        wallet.emit = onChange;
        return wallet.stop;
      },
    ),
  };
});

const addToast = vi.hoisted(() => vi.fn());
vi.mock("@/components/shared/toast", () => ({
  // Stable reference: the hook lists addToast as an effect dependency.
  useToastContext: () => ({ addToast }),
}));

const ADDRESS = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV";
const OTHER_ADDRESS = "GZYXWVUTSRQPONMLKJIHGFEDCBA765432ZYXWVUTSRQPONMLKJIHGFED";

function change(overrides: Partial<WalletChange> = {}): WalletChange {
  return {
    address: ADDRESS,
    network: "TESTNET",
    networkPassphrase: "Test SDF Network ; September 2015",
    ...overrides,
  };
}

function signIn(network: "testnet" | "public" = "testnet") {
  act(() => {
    useAuthStore.setState({
      walletAddress: ADDRESS,
      jwt: "jwt-1",
      refreshToken: "refresh-1",
      isAuthenticated: true,
      hasHydrated: true,
      network,
      error: null,
    });
  });
}

function emit(c: WalletChange) {
  act(() => {
    wallet.emit?.(c);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  wallet.emit = undefined;
  act(() => {
    useAuthStore.setState({
      walletAddress: null,
      jwt: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: true,
      network: "testnet",
      error: null,
    });
  });
});

describe("useWalletWatcher (#358)", () => {
  it("does not start watching while no wallet is connected", () => {
    renderHook(() => useWalletWatcher());

    expect(wallet.watchWalletChanges).not.toHaveBeenCalled();
  });

  it("starts watching once a wallet connects, and stops on unmount", () => {
    signIn();
    const { unmount } = renderHook(() => useWalletWatcher());

    expect(wallet.watchWalletChanges).toHaveBeenCalledTimes(1);
    expect(wallet.stop).not.toHaveBeenCalled();

    unmount();

    expect(wallet.stop).toHaveBeenCalledTimes(1);
  });

  it("stops watching when the wallet disconnects", () => {
    signIn();
    renderHook(() => useWalletWatcher());

    act(() => {
      useAuthStore.getState().disconnect();
    });

    expect(wallet.stop).toHaveBeenCalledTimes(1);
  });

  describe("account change", () => {
    it("notifies the user and disconnects the session", () => {
      signIn();
      renderHook(() => useWalletWatcher());

      emit(change({ address: OTHER_ADDRESS }));

      expect(addToast).toHaveBeenCalledTimes(1);
      expect(addToast).toHaveBeenCalledWith(
        "Your Freighter account changed. Please reconnect to continue.",
        "warning",
      );
      const state = useAuthStore.getState();
      expect(state.walletAddress).toBeNull();
      expect(state.jwt).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("does not treat an empty address as a switch", () => {
      signIn();
      renderHook(() => useWalletWatcher());

      emit(change({ address: "" }));

      expect(addToast).not.toHaveBeenCalled();
      expect(useAuthStore.getState().walletAddress).toBe(ADDRESS);
    });

    it("does not leave the store on the old wallet's token after a switch", () => {
      // The JWT was issued for the previous address, so it must not survive.
      signIn();
      renderHook(() => useWalletWatcher());

      emit(change({ address: OTHER_ADDRESS, network: "PUBLIC" }));

      expect(useAuthStore.getState().jwt).toBeNull();
      // The account branch returns early: the network is not also applied.
      expect(useAuthStore.getState().network).toBe("testnet");
    });
  });

  describe("network change", () => {
    it("notifies the user and updates the store, keeping the session", () => {
      signIn("testnet");
      renderHook(() => useWalletWatcher());

      emit(change({ network: "PUBLIC" }));

      expect(addToast).toHaveBeenCalledTimes(1);
      expect(addToast).toHaveBeenCalledWith("Freighter switched to PUBLIC.", "info");
      const state = useAuthStore.getState();
      expect(state.network).toBe("public");
      expect(state.walletAddress).toBe(ADDRESS);
      expect(state.isAuthenticated).toBe(true);
    });

    it("maps any non-PUBLIC network (e.g. FUTURENET) to testnet", () => {
      signIn("public");
      renderHook(() => useWalletWatcher());

      emit(change({ network: "FUTURENET" }));

      expect(useAuthStore.getState().network).toBe("testnet");
      expect(addToast).toHaveBeenCalledWith("Freighter switched to FUTURENET.", "info");
    });

    it("does not restart the watcher when the network changes", () => {
      signIn("testnet");
      renderHook(() => useWalletWatcher());

      emit(change({ network: "PUBLIC" }));

      expect(wallet.watchWalletChanges).toHaveBeenCalledTimes(1);
      expect(wallet.stop).not.toHaveBeenCalled();
    });

    it("compares against the latest network, not the one from mount", () => {
      signIn("testnet");
      renderHook(() => useWalletWatcher());

      emit(change({ network: "PUBLIC" }));
      addToast.mockClear();
      // Freighter reports PUBLIC again: already applied, so no repeat notice.
      emit(change({ network: "PUBLIC" }));

      expect(addToast).not.toHaveBeenCalled();
    });
  });

  it("ignores a report that matches the current account and network", () => {
    signIn("testnet");
    renderHook(() => useWalletWatcher());

    emit(change({ address: ADDRESS, network: "TESTNET" }));

    expect(addToast).not.toHaveBeenCalled();
    expect(useAuthStore.getState().walletAddress).toBe(ADDRESS);
    expect(useAuthStore.getState().network).toBe("testnet");
  });
});

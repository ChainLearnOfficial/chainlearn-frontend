import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/store/auth-store";
import { useWalletWatcher } from "./use-wallet-watcher";

vi.hoisted(() => {
  const map = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      get length() { return map.size; },
      clear: () => map.clear(),
      getItem: (key: string) => map.get(key) ?? null,
      key: (index: number) => Array.from(map.keys())[index] ?? null,
      removeItem: (key: string) => { map.delete(key); },
      setItem: (key: string, value: string) => { map.set(key, value); },
    },
    writable: true,
    configurable: true,
  });
});

type Change = { address: string; network: string; networkPassphrase: string };

const stop = vi.hoisted(() => vi.fn());
const watchState = vi.hoisted(() => ({ emit: null as null | ((c: Change) => void) }));
const addToast = vi.hoisted(() => vi.fn());

vi.mock("@/lib/stellar/wallet", async () => {
  const actual = await vi.importActual<typeof import("@/lib/stellar/wallet")>(
    "@/lib/stellar/wallet"
  );
  return {
    ...actual,
    watchWalletChanges: (cb: (c: Change) => void) => {
      watchState.emit = cb;
      return stop;
    },
  };
});

vi.mock("@/components/shared/toast", () => ({
  useToastContext: () => ({ addToast }),
}));

function connect(address: string | null) {
  act(() => {
    useAuthStore.setState({
      walletAddress: address,
      network: "testnet",
      isAuthenticated: !!address,
      jwt: address ? "jwt" : null,
    });
  });
}

beforeEach(() => {
  addToast.mockReset();
  stop.mockReset();
  watchState.emit = null;
  connect(null);
});

describe("useWalletWatcher", () => {
  it("does not start watching while no wallet is connected", () => {
    renderHook(() => useWalletWatcher());
    expect(watchState.emit).toBeNull();
  });

  it("detects an account change: notifies the user and disconnects the session", () => {
    connect("GAAA");
    renderHook(() => useWalletWatcher());

    act(() =>
      watchState.emit!({ address: "GBBB", network: "TESTNET", networkPassphrase: "x" })
    );

    expect(addToast).toHaveBeenCalledWith(expect.stringContaining("account changed"), "warning");
    expect(useAuthStore.getState().walletAddress).toBeNull();
  });

  it("detects a network change: updates the store and notifies the user", () => {
    connect("GAAA");
    renderHook(() => useWalletWatcher());

    act(() =>
      watchState.emit!({ address: "GAAA", network: "PUBLIC", networkPassphrase: "x" })
    );

    expect(useAuthStore.getState().network).toBe("public");
    expect(addToast).toHaveBeenCalledWith(expect.stringContaining("PUBLIC"), "info");
    expect(useAuthStore.getState().walletAddress).toBe("GAAA");
  });

  it("ignores a report where nothing actually changed", () => {
    connect("GAAA");
    renderHook(() => useWalletWatcher());

    act(() =>
      watchState.emit!({ address: "GAAA", network: "TESTNET", networkPassphrase: "x" })
    );

    expect(addToast).not.toHaveBeenCalled();
    expect(useAuthStore.getState().walletAddress).toBe("GAAA");
  });

  it("stops the watcher on unmount", () => {
    connect("GAAA");
    const { unmount } = renderHook(() => useWalletWatcher());
    unmount();
    expect(stop).toHaveBeenCalled();
  });
});

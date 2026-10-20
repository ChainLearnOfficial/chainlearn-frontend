"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useToastContext } from "@/components/shared/toast";
import { normalizeNetwork, watchWalletChanges } from "@/lib/stellar/wallet";

/**
 * Reacts to the user switching accounts or networks inside the Freighter
 * extension while ChainLearn is open.
 *
 * A stale `walletAddress`/`network` in the store after such a switch would
 * silently keep signing requests, balance reads, and contract calls against
 * the wallet the user just moved away from. Mounted once at the root of the
 * authenticated tree (see AuthProvider), same as useTokenRefresh.
 *
 * An account switch disconnects the session outright rather than just
 * updating `walletAddress`: the JWT was issued for the previous address'
 * SEP-10 challenge, so silently swapping the address in the store while
 * keeping that token would leave the UI showing one identity while every
 * authenticated request still authenticates as another.
 */
export function useWalletWatcher(): void {
  const walletAddress = useAuthStore((s) => s.walletAddress);
  const network = useAuthStore((s) => s.network);
  const disconnect = useAuthStore((s) => s.disconnect);
  const setNetwork = useAuthStore((s) => s.setNetwork);
  const { addToast } = useToastContext();

  // Read inside the effect via refs rather than depending on them directly —
  // the watcher itself should only be (re)started when the wallet connects or
  // disconnects, not on every change it reports.
  const walletAddressRef = useRef(walletAddress);
  walletAddressRef.current = walletAddress;
  const networkRef = useRef(network);
  networkRef.current = network;

  useEffect(() => {
    if (!walletAddress) return;

    const stop = watchWalletChanges((change) => {
      if (change.address && change.address !== walletAddressRef.current) {
        addToast(
          "Your Freighter account changed. Please reconnect to continue.",
          "warning"
        );
        disconnect();
        return;
      }

      const nextNetwork = normalizeNetwork(change.network);
      if (nextNetwork !== networkRef.current) {
        addToast(`Freighter switched to ${change.network}.`, "info");
        setNetwork(nextNetwork);
      }
    });

    return stop;
  }, [walletAddress, addToast, disconnect, setNetwork]);
}

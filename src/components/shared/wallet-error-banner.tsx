"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, ExternalLink } from "lucide-react";
import type { WalletError } from "@/lib/hooks/use-auth";
import { getSelectedWalletId, type WalletProviderId } from "@/lib/stellar/wallet";

interface WalletErrorBannerProps {
  error: WalletError;
  onDismiss: () => void;
  onRetry?: () => void;
}

const WALLET_INSTALL_LINKS: Record<
  WalletProviderId,
  { name: string; url: string }
> = {
  freighter: { name: "Freighter", url: "https://www.freighter.app/" },
  lobstr: { name: "LOBSTR", url: "https://lobstr.co/" },
  rabet: { name: "Rabet", url: "https://rabet.io/" },
};

const ALL_WALLETS = Object.values(WALLET_INSTALL_LINKS);

function resolveInstallLinks(
  walletId: string | null
): Array<{ name: string; url: string }> {
  if (walletId && walletId in WALLET_INSTALL_LINKS) {
    return [
      WALLET_INSTALL_LINKS[walletId as WalletProviderId],
    ];
  }
  return ALL_WALLETS;
}

export function WalletErrorBanner({
  error,
  onDismiss,
  onRetry,
}: WalletErrorBannerProps) {
  const [walletId, setWalletId] = useState<string | null>(null);

  useEffect(() => {
    setWalletId(getSelectedWalletId());
  }, []);

  const installLinks = resolveInstallLinks(walletId);

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">{error.message}</p>
          <p className="text-sm text-red-600 mt-1">{error.resolution}</p>
          {error.type === "not_installed" && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {installLinks.map((wallet) => (
                <a
                  key={wallet.name}
                  href={wallet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-red-700 underline hover:text-red-900"
                >
                  Get {wallet.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 rounded p-1 text-red-400 hover:text-red-600 hover:bg-red-100"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

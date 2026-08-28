"use client";

import { AlertTriangle, X, ExternalLink } from "lucide-react";
import type { WalletError } from "@/lib/hooks/use-auth";

interface WalletErrorBannerProps {
  error: WalletError;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function WalletErrorBanner({
  error,
  onDismiss,
  onRetry,
}: WalletErrorBannerProps) {
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
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-red-700 underline mt-2 hover:text-red-900"
            >
              Get Freighter
              <ExternalLink className="h-3 w-3" />
            </a>
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

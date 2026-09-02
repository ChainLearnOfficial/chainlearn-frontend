"use client";

import { useRewards } from "@/lib/hooks/use-rewards";
import { useTokenPrice } from "@/lib/hooks/use-token-price";
import { formatTokenBalance } from "@/lib/utils/format";
import { Coins, ExternalLink, Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useCallback } from "react";
import Link from "next/link";

interface BalanceDisplayProps {
  className?: string;
  compact?: boolean;
}

export function BalanceDisplay({ className, compact = false }: BalanceDisplayProps) {
  const { balances, loading, refetch } = useRewards();
  const [copied, setCopied] = useState(false);

  const primaryBalance = balances[0];
  const tokenCode = primaryBalance?.tokenCode || "LEARN";
  const decimals = primaryBalance?.decimals ?? 7;
  const issuer = primaryBalance?.tokenIssuer;
  const rawBalance = primaryBalance ? parseFloat(primaryBalance.balance) : 0;
  const balanceVal = isNaN(rawBalance) ? 0 : rawBalance / Math.pow(10, decimals);
  const balanceStr = formatTokenBalance(balanceVal, 0);

  // Derive the deployed address for the current network from the balance's
  // issuer when available, so users always have a copyable asset address.
  const contractAddress = issuer ?? "";

  const { usdRate, usdLoading } = useTokenPrice(
    tokenCode,
    issuer,
    primaryBalance?.balance ? 1 : 0
  );

  const handleCopyContract = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!contractAddress) return;
      navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [contractAddress]
  );

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    refetch();
  };

  const usdValue =
    usdRate !== null
      ? (balanceVal * usdRate).toFixed(2)
      : "0.00";

  if (loading || usdLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-20 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5 text-sm font-medium cursor-help", className)}>
            <Coins className="h-4 w-4 text-stellar-purple" />
            <span>{balanceStr}</span>
            <span className="text-gray-500">{tokenCode}</span>
            <span className="text-xs text-gray-400">($ {usdValue})</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Available {tokenCode} balance (${usdValue} USD)</p>
          <p className="text-gray-300">{tokenCode} decimals: {decimals}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-gradient-to-br from-stellar-purple/5 to-stellar-blue/5 p-4 dark:border-gray-800 dark:bg-gray-900/50",
        className
      )}
    >
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-stellar-purple" />
          Token Balance
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs text-stellar-purple hover:underline dark:text-purple-400"
        >
          View Transactions <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{balanceStr}</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{tokenCode}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            ≈ ${usdValue} USD
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
            <span>{tokenCode} decimals: {decimals}</span>
            {issuer && (
              <span className="font-mono truncate max-w-[12rem]" title={`Issuer: ${issuer}`}>
                Issuer: {issuer.slice(0, 6)}…
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
          <button
            type="button"
            onClick={handleCopyContract}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Copy contract address"
            disabled={!contractAddress}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="font-mono text-[10px]">
              {contractAddress.length > 12
                ? `${contractAddress.slice(0, 4)}...${contractAddress.slice(-4)}`
                : contractAddress}
            </span>
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

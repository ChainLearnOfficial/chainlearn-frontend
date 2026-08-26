"use client";

import { useRewards } from "@/lib/hooks/use-rewards";
import { formatTokenBalance } from "@/lib/utils/format";
import { Coins, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BalanceDisplayProps {
  className?: string;
  compact?: boolean;
}

export function BalanceDisplay({ className, compact = false }: BalanceDisplayProps) {
  const { balances, loading } = useRewards();

  const primaryBalance = balances[0];
  const balance = primaryBalance
    ? formatTokenBalance(primaryBalance.balance, primaryBalance.decimals)
    : "0";

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-8 w-24 rounded bg-gray-200" />
      </div>
    );
  }

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5 text-sm font-medium cursor-help", className)}>
            <Coins className="h-4 w-4 text-stellar-purple" />
            <span>{balance}</span>
            <span className="text-gray-500">{primaryBalance?.tokenCode || "LEARN"}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Available {primaryBalance?.tokenCode || "LEARN"} balance</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "rounded-xl border border-gray-200 bg-gradient-to-br from-stellar-purple/5 to-stellar-blue/5 p-4 cursor-help",
            className
          )}
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Coins className="h-4 w-4" />
            Token Balance
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{balance}</span>
            <span className="text-sm text-gray-500">
              {primaryBalance?.tokenCode || "LEARN"}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Your total {primaryBalance?.tokenCode || "LEARN"} balance</p>
      </TooltipContent>
    </Tooltip>
  );
}

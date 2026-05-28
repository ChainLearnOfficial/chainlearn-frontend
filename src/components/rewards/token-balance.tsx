"use client";

import { cn } from "@/lib/utils/cn";
import { Coins } from "lucide-react";
import { formatTokenBalance } from "@/lib/utils/format";
import type { TokenBalance as TokenBalanceType } from "@/types/stellar";

interface TokenBalanceProps {
  balance: TokenBalanceType;
  className?: string;
}

export function TokenBalance({ balance, className }: TokenBalanceProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stellar-purple/10">
        <Coins className="h-5 w-5 text-stellar-purple" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{balance.tokenCode}</p>
        <p className="text-lg font-bold text-gray-900">
          {formatTokenBalance(balance.balance, balance.decimals)}
        </p>
      </div>
    </div>
  );
}

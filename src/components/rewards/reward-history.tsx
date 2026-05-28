"use client";

import { cn } from "@/lib/utils/cn";
import { formatDate, formatTokenBalance, truncateAddress } from "@/lib/utils/format";
import { ExternalLink, CheckCircle, Clock, XCircle } from "lucide-react";
import type { RewardClaim } from "@/types/stellar";

interface RewardHistoryProps {
  claims: RewardClaim[];
  className?: string;
}

const statusIcons = {
  confirmed: CheckCircle,
  pending: Clock,
  failed: XCircle,
};

const statusColors = {
  confirmed: "text-green-500",
  pending: "text-yellow-500",
  failed: "text-red-500",
};

export function RewardHistory({ claims, className }: RewardHistoryProps) {
  if (claims.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <p className="text-sm">No reward history yet.</p>
        <p className="text-xs mt-1">Complete courses and quizzes to earn LEARN tokens.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {claims.map((claim) => {
        const StatusIcon = statusIcons[claim.status];
        return (
          <div
            key={claim.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
          >
            <div className="flex items-center gap-3">
              <StatusIcon
                className={cn("h-5 w-5", statusColors[claim.status])}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {claim.courseTitle || "Reward"}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(claim.claimedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-stellar-purple">
                +{formatTokenBalance(claim.amount)} {claim.tokenCode}
              </span>
              {claim.txHash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${claim.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

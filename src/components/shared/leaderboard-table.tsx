"use client";

import { memo } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  getInitials,
} from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils/format";
import { Trophy } from "lucide-react";

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  avatarUrl?: string;
}

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  /** Highlight this entry (usually the signed-in user). */
  currentUserId?: string;
  /** Compact mode for sidebars — tighter cells and no avatars. */
  compact?: boolean;
  className?: string;
}

const rankStyles = [
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300",
  "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
];

function RankCell({ rank, compact }: { rank: number; compact: boolean }) {
  if (rank > 3) {
    return (
      <span
        className={cn(
          "font-mono font-medium text-gray-500 dark:text-gray-400",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {rank}
      </span>
    );
  }
  const styles = rankStyles[rank - 1];
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full font-medium text-xs",
        styles
      )}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

/**
 * Leaderboard table showing top learners by score with their rank. Supports a
 * compact mode for sidebars and a full mode for page-level displays. The
 * current user's row is highlighted and flagged with a "You" badge.
 */
export const LeaderboardTable = memo(function LeaderboardTable({
  entries,
  currentUserId,
  compact = false,
  className,
}: LeaderboardTableProps) {
  return (
    <Table
      className={cn(
        compact && "[&_td]:p-3 [&_th]:px-3 [&_th]:py-2",
        className
      )}
      aria-label="Leaderboard"
    >
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">Rank</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody striped={!compact}>
        {entries.map((entry, index) => {
          const rank = index + 1;
          const isCurrent = entry.id === currentUserId;
          return (
            <TableRow
              key={entry.id}
              hoverable
              className={cn(
                isCurrent &&
                  "bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100/70 dark:hover:bg-primary-900/40"
              )}
            >
              <TableCell className={cn(compact && "py-2.5")}>
                <RankCell rank={rank} compact={compact} />
              </TableCell>
              <TableCell className={cn(compact && "py-2.5")}>
                <div className="flex items-center gap-3">
                  {!compact && (
                    <Avatar size="sm">
                      {entry.avatarUrl ? (
                        <AvatarImage
                          src={entry.avatarUrl}
                          alt={`${entry.name} avatar`}
                        />
                      ) : null}
                      <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                    </Avatar>
                  )}
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {entry.name}
                  </span>
                  {isCurrent && (
                    <Badge
                      variant="default"
                      className="hidden sm:inline-flex"
                    >
                      You
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm font-semibold tabular-nums",
                  compact && "py-2.5"
                )}
              >
                {formatNumber(entry.score)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
});
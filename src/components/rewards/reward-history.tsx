"use client";

import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatTokenBalance, truncateAddress } from "@/lib/utils/format";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/auth-store";
import {
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { RewardClaim } from "@/types/stellar";

// ── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "confirmed" | "pending" | "failed";

interface Filters {
  status: StatusFilter;
  course: string;       // debounced free-text search on courseTitle
  dateFrom: string;     // ISO date string, e.g. "2024-01-01"
  dateTo: string;
}

interface RewardHistoryProps {
  claims: RewardClaim[];
  className?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_ICONS = {
  confirmed: CheckCircle,
  pending: Clock,
  failed: XCircle,
} as const;

const STATUS_COLORS = {
  confirmed: "text-green-500",
  pending: "text-yellow-500",
  failed: "text-red-500",
} as const;

const STATUS_BADGE_VARIANTS = {
  confirmed: "success",
  pending: "warning",
  failed: "destructive",
} as const satisfies Record<RewardClaim["status"], "success" | "warning" | "destructive">;

const EMPTY_FILTERS: Filters = {
  status: "all",
  course: "",
  dateFrom: "",
  dateTo: "",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseAmount(claim: RewardClaim): number {
  const raw = parseFloat(claim.amount || "0");
  const divisor = Math.pow(10, claim.decimals ?? 7);
  return isNaN(raw) ? 0 : raw / divisor;
}

/** Build and trigger a CSV download from the filtered claims list. */
function exportToCsv(claims: RewardClaim[]): void {
  const header = ["Date", "Course", "Amount", "Token", "Status", "Tx Hash"];
  const rows = claims.map((c) => [
    formatDate(c.claimedAt),
    c.courseTitle ?? "",
    parseAmount(c).toFixed(2),
    c.tokenCode,
    c.status,
    c.txHash ?? "",
  ]);

  const escape = (v: string) =>
    `"${v.replace(/"/g, '""')}"`;

  const csv =
    [header, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reward-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Summary stats sub-component ───────────────────────────────────────────────

interface SummaryStatsProps {
  claims: RewardClaim[];
}

function SummaryStats({ claims }: SummaryStatsProps) {
  const stats = useMemo(() => {
    let totalEarned = 0;
    let confirmedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    for (const c of claims) {
      if (c.status === "confirmed") {
        totalEarned += parseAmount(c);
        confirmedCount++;
      } else if (c.status === "pending") {
        pendingCount++;
      } else {
        failedCount++;
      }
    }

    return { totalEarned, confirmedCount, pendingCount, failedCount };
  }, [claims]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Reward summary">
      <StatTile
        label="Total earned"
        value={`${stats.totalEarned.toLocaleString("en-US", { maximumFractionDigits: 2 })} LEARN`}
        valueClassName="text-green-600 dark:text-green-400"
      />
      <StatTile
        label="Confirmed"
        value={stats.confirmedCount}
        valueClassName="text-green-600 dark:text-green-400"
      />
      <StatTile
        label="Pending"
        value={stats.pendingCount}
        valueClassName="text-yellow-600 dark:text-yellow-400"
      />
      <StatTile
        label="Failed"
        value={stats.failedCount}
        valueClassName="text-red-600 dark:text-red-400"
      />
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

function StatTile({ label, value, valueClassName }: StatTileProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={cn("text-sm font-semibold mt-0.5 truncate", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

// ── Filter bar sub-component ─────────────────────────────────────────────────

interface FilterBarProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  onExport: () => void;
  resultCount: number;
  totalCount: number;
}

function FilterBar({
  filters,
  onChange,
  onReset,
  onExport,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const isDirty =
    filters.status !== "all" ||
    filters.course !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Course search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by course..."
            value={filters.course}
            onChange={(e) => onChange({ course: e.target.value })}
            className="pl-9"
            aria-label="Search by course name"
          />
        </div>

        {/* Status filter */}
        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ status: v as StatusFilter })}
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by status">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 mr-1.5 flex-shrink-0" aria-hidden="true" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Date from */}
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          className="w-[150px]"
          aria-label="From date"
          title="From date"
        />

        {/* Date to */}
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          className="w-[150px]"
          aria-label="To date"
          title="To date"
        />

        {/* Clear filters */}
        {isDirty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1 text-gray-500"
            aria-label="Clear all filters"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </Button>
        )}

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="gap-1.5 ml-auto"
          aria-label={`Export ${resultCount} results as CSV`}
          disabled={resultCount === 0}
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      {/* Result count */}
      {isDirty && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {resultCount} of {totalCount} transactions
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RewardHistory({ claims, className }: RewardHistoryProps) {
  const network = useAuthStore((s) => s.network);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const debouncedCourse = useDebounce(filters.course, 250);

  const updateFilter = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  // Combined filter — all predicates must pass
  const filtered = useMemo(() => {
    return claims.filter((c) => {
      // Status
      if (filters.status !== "all" && c.status !== filters.status) return false;

      // Course title search (debounced)
      if (debouncedCourse) {
        const title = (c.courseTitle ?? "").toLowerCase();
        if (!title.includes(debouncedCourse.toLowerCase())) return false;
      }

      // Date range
      if (filters.dateFrom) {
        const claimDate = new Date(c.claimedAt);
        const fromDate = new Date(filters.dateFrom);
        if (claimDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const claimDate = new Date(c.claimedAt);
        // Include the full "to" day by advancing to next midnight
        const toDate = new Date(filters.dateTo);
        toDate.setDate(toDate.getDate() + 1);
        if (claimDate >= toDate) return false;
      }

      return true;
    });
  }, [claims, filters.status, debouncedCourse, filters.dateFrom, filters.dateTo]);

  const handleExport = useCallback(() => {
    exportToCsv(filtered);
  }, [filtered]);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Summary stats — always over full unfiltered claims */}
      <SummaryStats claims={claims} />

      <Separator />

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={updateFilter}
        onReset={resetFilters}
        onExport={handleExport}
        resultCount={filtered.length}
        totalCount={claims.length}
      />

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          {claims.length === 0 ? (
            <>
              <p className="text-sm">No reward history yet.</p>
              <p className="text-xs mt-1">
                Complete courses and quizzes to earn LEARN tokens.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm">No transactions match your filters.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="mt-2 text-xs text-gray-500"
              >
                Clear filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <ScrollArea className="h-[min(28rem,65vh)]">
          <div className="space-y-2 pr-3" role="list" aria-label="Reward transactions">
            {filtered.map((claim) => {
              const StatusIcon = STATUS_ICONS[claim.status];
              return (
                <div
                  key={claim.id}
                  role="listitem"
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 gap-3"
                >
                  {/* Left: icon + title + date */}
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        STATUS_COLORS[claim.status]
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {claim.courseTitle || "Reward"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(claim.claimedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right: amount + status badge + explorer link */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 tabular-nums">
                      +{formatTokenBalance(claim.amount, claim.decimals ?? 7)}{" "}
                      {claim.tokenCode}
                    </span>

                    <Badge variant={STATUS_BADGE_VARIANTS[claim.status]}>
                      {claim.status}
                    </Badge>

                    {claim.txHash && (
                      <a
                        href={`https://stellar.expert/explorer/${network}/tx/${claim.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={`View transaction ${truncateAddress(claim.txHash)} on Stellar Explorer`}
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export type StatsCardColor =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "muted";

export type StatsCardTrend = "up" | "down" | "flat";

const colorThemes: Record<
  StatsCardColor,
  { iconContainer: string; icon: string }
> = {
  primary: { iconContainer: "bg-primary-100", icon: "text-primary-600" },
  success: { iconContainer: "bg-green-100", icon: "text-green-600" },
  warning: { iconContainer: "bg-yellow-100", icon: "text-yellow-600" },
  danger: { iconContainer: "bg-red-100", icon: "text-red-600" },
  purple: {
    iconContainer: "bg-stellar-purple/10",
    icon: "text-stellar-purple",
  },
  muted: { iconContainer: "bg-gray-100", icon: "text-gray-600" },
};

const trendStyles: Record<StatsCardTrend, { icon: LucideIcon; className: string }> = {
  up: { icon: TrendingUp, className: "text-green-600 dark:text-green-400" },
  down: { icon: TrendingDown, className: "text-red-600 dark:text-red-400" },
  flat: { icon: Minus, className: "text-gray-500 dark:text-gray-400" },
};

export interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  color?: StatsCardColor;
  trend?: StatsCardTrend;
  /** Optional label describing the trend, e.g. "12% this week". */
  trendLabel?: string;
  className?: string;
}

/**
 * Reusable metric card for the dashboard and profile pages. Replaces the
 * ad-hoc stat cards that were duplicated with inline styles so every metric
 * renders with the same icon treatment, typography and spacing.
 */
export function StatsCard({
  icon: Icon,
  label,
  value,
  color = "primary",
  trend,
  trendLabel,
  className,
}: StatsCardProps) {
  const theme = colorThemes[color];
  const trendMeta = trend !== undefined ? trendStyles[trend] : undefined;

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
            theme.iconContainer
          )}
          aria-hidden="true"
        >
          <Icon className={cn("h-5 w-5", theme.icon)} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          {trendMeta && (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium">
              <trendMeta.icon
                className={cn("h-3.5 w-3.5 flex-shrink-0", trendMeta.className)}
                aria-hidden="true"
              />
              <span className={trendMeta.className}>
                {trendLabel ??
                  (trend === "up"
                    ? "Trending up"
                    : trend === "down"
                      ? "Trending down"
                      : "No change")}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = "md",
  showLabel = true,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium text-gray-700">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-gray-100", heights[size])}>
        <div
          className={cn(
            "rounded-full bg-primary-500 transition-all duration-500",
            heights[size]
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

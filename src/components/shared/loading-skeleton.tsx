"use client";

import { cn } from "@/lib/utils/cn";

const loadingA11yProps = {
  role: "status" as const,
  "aria-live": "polite" as const,
  "aria-busy": true,
  "aria-label": "Loading",
};

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  variant?: "card" | "text" | "circle";
}

export function LoadingSkeleton({
  className,
  count = 1,
  variant = "card",
}: LoadingSkeletonProps) {
  const variants = {
    card: "h-48 w-full rounded-xl",
    text: "h-4 w-full rounded",
    circle: "h-12 w-12 rounded-full",
  };

  return (
    <div {...loadingA11yProps} className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-gray-200",
            variants[variant]
          )}
        />
      ))}
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div
      {...loadingA11yProps}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
    >
      <div className="h-40 animate-pulse bg-gray-200" aria-hidden="true" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse bg-gray-200 rounded-full" aria-hidden="true" />
          <div className="h-5 w-20 animate-pulse bg-gray-200 rounded-full" aria-hidden="true" />
        </div>
        <div className="h-5 w-3/4 animate-pulse bg-gray-200 rounded" aria-hidden="true" />
        <div className="h-4 w-full animate-pulse bg-gray-200 rounded" aria-hidden="true" />
        <div className="h-4 w-2/3 animate-pulse bg-gray-200 rounded" aria-hidden="true" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div {...loadingA11yProps} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse bg-gray-200 rounded-xl"
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

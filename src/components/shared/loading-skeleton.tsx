"use client";

import { cn } from "@/lib/utils/cn";

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
    <div className={cn("space-y-3", className)}>
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
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="h-40 animate-pulse bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse bg-gray-200 rounded-full" />
          <div className="h-5 w-20 animate-pulse bg-gray-200 rounded-full" />
        </div>
        <div className="h-5 w-3/4 animate-pulse bg-gray-200 rounded" />
        <div className="h-4 w-full animate-pulse bg-gray-200 rounded" />
        <div className="h-4 w-2/3 animate-pulse bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse bg-gray-200 rounded-xl"
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

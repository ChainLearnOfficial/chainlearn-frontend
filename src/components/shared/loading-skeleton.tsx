"use client";

import { cn } from "@/lib/utils/cn";
import {
  Skeleton,
  SkeletonCircle,
  SkeletonStack,
  SkeletonText,
  SkeletonRect,
  SkeletonCard,
} from "@/components/ui/skeleton";

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
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => {
        if (variant === "text") {
          return <SkeletonText key={i} />;
        }
        if (variant === "circle") {
          return <SkeletonCircle key={i} />;
        }
        return <SkeletonCard key={i} />;
      })}
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonRect className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <SkeletonRect className="h-5 w-16 rounded-full" />
          <SkeletonRect className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonText className="h-5 w-3/4" />
        <SkeletonStack lines={2} />
      </div>
    </SkeletonCard>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonRect key={i} className="h-24 w-full rounded-xl" />
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

export function CredentialCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex gap-4">
      <SkeletonRect className="h-12 w-12 flex-shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="h-5 w-1/2" />
        <SkeletonStack lines={2} />
      </div>
    </div>
  );
}

export function RewardsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <SkeletonCircle className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-1/3" />
          <SkeletonText className="w-1/4 h-3" />
        </div>
      </div>
      <SkeletonStack lines={4} />
    </div>
  );
}

export function VerifySkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      <SkeletonCircle className="mx-auto h-16 w-16" />
      <SkeletonText className="mx-auto h-6 w-2/3" />
      <SkeletonStack lines={3} className="mx-auto max-w-sm" />
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonRect className="h-48 w-full rounded-xl" />
      <SkeletonText className="h-8 w-2/3" />
      <SkeletonStack lines={4} />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonRect key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

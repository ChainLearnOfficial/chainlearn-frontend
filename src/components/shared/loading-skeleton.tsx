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

/**
 * Generic placeholder primitive. For page-shaped loading states prefer the
 * dedicated variants below (CourseGridSkeleton, TableSkeleton, FormSkeleton,
 * ProfileSkeleton, …) which mirror the real content structure.
 */
export function LoadingSkeleton({
  className,
  count = 1,
  variant = "card",
}: LoadingSkeletonProps) {
  const shape =
    variant === "text"
      ? "h-4 w-full rounded"
      : variant === "circle"
        ? "h-12 w-12 rounded-full"
        : "h-48 w-full rounded-xl";

  return (
    <div
      className={cn("space-y-3", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={shape} />
      ))}
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

/**
 * Responsive grid of course-card placeholders, matching the catalog and
 * dashboard grids (1 / 2 / 3 columns).
 */
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading courses…</span>
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Table placeholder with a header row and `rows` body rows. `columns` controls
 * the cell count; the first column is rendered wider to stand in for a label.
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading table…</span>
      <div className="flex gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonText
            key={i}
            className={cn("h-4", i === 0 ? "w-1/3" : "flex-1")}
          />
        ))}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, c) => (
              <SkeletonText
                key={c}
                className={cn("h-4", c === 0 ? "w-1/3" : "flex-1")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form placeholder: `fields` label + input pairs followed by a submit button.
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <span className="sr-only">Loading form…</span>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonText className="h-4 w-32" />
          <SkeletonRect className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <SkeletonRect className="h-10 w-32 rounded-lg" />
    </div>
  );
}

/**
 * Profile / account placeholder: avatar, name, meta line, and a details block.
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <span className="sr-only">Loading profile…</span>
      <div className="flex items-center gap-4">
        <SkeletonCircle className="h-20 w-20" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="h-6 w-1/3" />
          <SkeletonText className="h-4 w-1/4" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonText className="h-4 w-24" />
            <SkeletonText className="h-5 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <span className="sr-only">Loading dashboard…</span>
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex gap-4 dark:border-gray-800 dark:bg-gray-950">
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
    <div className="space-y-6" role="status" aria-busy="true">
      <span className="sr-only">Loading rewards…</span>
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
    <div className="mx-auto max-w-lg space-y-4 text-center" role="status" aria-busy="true">
      <span className="sr-only">Verifying…</span>
      <SkeletonCircle className="mx-auto h-16 w-16" />
      <SkeletonText className="mx-auto h-6 w-2/3" />
      <SkeletonStack lines={3} className="mx-auto max-w-sm" />
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <span className="sr-only">Loading course…</span>
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

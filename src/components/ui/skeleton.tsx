import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type SkeletonAnimation = "shimmer" | "pulse" | "none";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual shape preset. Defaults to a rounded rectangle. */
  variant?: "text" | "circle" | "rectangle";
  /**
   * Loading animation. `shimmer` (default) sweeps a highlight band across the
   * placeholder; `pulse` fades opacity; `none` is static (useful in tests or
   * when `prefers-reduced-motion` is handled upstream).
   */
  animation?: SkeletonAnimation;
}

const ANIMATION_CLASSES: Record<SkeletonAnimation, string> = {
  // 200%-wide gradient so the shimmer keyframe has room to travel. Falls back
  // to a static fill when the viewer prefers reduced motion.
  shimmer:
    "animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 motion-reduce:animate-none motion-reduce:bg-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 dark:motion-reduce:bg-gray-800",
  pulse: "animate-pulse bg-gray-200 motion-reduce:animate-none dark:bg-gray-800",
  none: "bg-gray-200 dark:bg-gray-800",
};

/**
 * Base skeleton block. Pass className to match real content dimensions.
 *
 * @example
 * <Skeleton className="h-4 w-3/4" />
 * <Skeleton variant="circle" className="h-10 w-10" />
 * <Skeleton variant="text" className="w-full" />
 * <Skeleton animation="pulse" className="h-24 w-full" />
 */
function Skeleton({
  className,
  variant = "rectangle",
  animation = "shimmer",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn(
        ANIMATION_CLASSES[animation],
        variant === "text" && "h-4 w-full rounded",
        variant === "circle" && "rounded-full",
        variant === "rectangle" && "rounded-md",
        className
      )}
      {...props}
    />
  );
}

Skeleton.displayName = "Skeleton";

/** Shortcut for a single line of text-shaped skeleton. */
function SkeletonText({
  className,
  ...props
}: Omit<SkeletonProps, "variant">) {
  return <Skeleton variant="text" className={className} {...props} />;
}

SkeletonText.displayName = "SkeletonText";

/** Shortcut for an avatar / icon circle skeleton. */
function SkeletonCircle({
  className,
  ...props
}: Omit<SkeletonProps, "variant">) {
  return (
    <Skeleton
      variant="circle"
      className={cn("h-12 w-12", className)}
      {...props}
    />
  );
}

SkeletonCircle.displayName = "SkeletonCircle";

/**
 * Stack of text skeletons for paragraph / list placeholders.
 */
function SkeletonStack({
  lines = 3,
  className,
  animation,
}: {
  lines?: number;
  className?: string;
  animation?: SkeletonAnimation;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText
          key={i}
          animation={animation}
          className={i === lines - 1 ? "w-2/3" : "w-full"}
        />
      ))}
    </div>
  );
}

SkeletonStack.displayName = "SkeletonStack";

/** Shortcut for a rectangular skeleton. */
function SkeletonRect({
  className,
  ...props
}: Omit<SkeletonProps, "variant">) {
  return <Skeleton variant="rectangle" className={className} {...props} />;
}

SkeletonRect.displayName = "SkeletonRect";

/** Shortcut for a card skeleton. */
function SkeletonCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <SkeletonRect className="h-40 w-full rounded-none" />
          <div className="p-4 space-y-3">
            <SkeletonText className="h-5 w-3/4" />
            <SkeletonStack lines={2} />
          </div>
        </>
      )}
    </div>
  );
}

SkeletonCard.displayName = "SkeletonCard";

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonStack,
  SkeletonRect,
  SkeletonCard,
};

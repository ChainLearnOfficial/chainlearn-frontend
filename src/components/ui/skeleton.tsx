import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual shape preset. Defaults to a rounded rectangle. */
  variant?: "text" | "circle" | "rectangle";
}

/**
 * Base pulse skeleton. Pass className to match real content dimensions.
 *
 * @example
 * <Skeleton className="h-4 w-3/4" />
 * <Skeleton variant="circle" className="h-10 w-10" />
 * <Skeleton variant="text" className="w-full" />
 */
function Skeleton({
  className,
  variant = "rectangle",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-gray-200",
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
}: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton variant="text" className={className} {...props} />;
}

SkeletonText.displayName = "SkeletonText";

/** Shortcut for an avatar / icon circle skeleton. */
function SkeletonCircle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
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
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText
          key={i}
          className={i === lines - 1 ? "w-2/3" : "w-full"}
        />
      ))}
    </div>
  );
}

SkeletonStack.displayName = "SkeletonStack";

/** Shortcut for a standard rectangle skeleton. */
function SkeletonRect({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton variant="rectangle" className={className} {...props} />;
}
SkeletonRect.displayName = "SkeletonRect";

/** Shortcut for a card skeleton. */
function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton variant="rectangle" className={cn("h-48 w-full rounded-xl", className)} {...props} />;
}
SkeletonCard.displayName = "SkeletonCard";

export { Skeleton, SkeletonText, SkeletonCircle, SkeletonStack, SkeletonRect, SkeletonCard };

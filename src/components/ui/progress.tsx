"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils/cn";

export type ProgressVariant = "linear" | "circular";
export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: ProgressVariant;
  size?: ProgressSize;
  /** Tailwind color class for the fill, e.g. "bg-primary-500" or "stroke-primary-500" for circular */
  indicatorClassName?: string;
  trackClassName?: string;
  showValue?: boolean;
}

const linearHeights: Record<ProgressSize, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const circularSizes: Record<ProgressSize, { box: string; stroke: number; r: number }> = {
  sm: { box: "h-8 w-8", stroke: 3, r: 14 },
  md: { box: "h-12 w-12", stroke: 4, r: 20 },
  lg: { box: "h-16 w-16", stroke: 5, r: 28 },
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      variant = "linear",
      size = "md",
      indicatorClassName,
      trackClassName,
      showValue = false,
      max = 100,
      ...props
    },
    ref
  ) => {
    const clamped = Math.min(Number(max), Math.max(0, Number(value ?? 0)));
    const percent = Number(max) > 0 ? (clamped / Number(max)) * 100 : 0;

    if (variant === "circular") {
      const config = circularSizes[size];
      const viewBox = config.r * 2 + config.stroke * 2;
      const center = viewBox / 2;
      const circumference = 2 * Math.PI * config.r;
      const offset = circumference - (percent / 100) * circumference;

      return (
        <ProgressPrimitive.Root
          ref={ref}
          value={clamped}
          max={max}
          className={cn(
            "relative inline-flex items-center justify-center",
            config.box,
            className
          )}
          {...props}
        >
          <svg
            className="h-full w-full -rotate-90"
            viewBox={`0 0 ${viewBox} ${viewBox}`}
            aria-hidden="true"
          >
            <circle
              className={cn("stroke-gray-100", trackClassName)}
              cx={center}
              cy={center}
              r={config.r}
              fill="none"
              strokeWidth={config.stroke}
            />
            <circle
              className={cn(
                "stroke-primary-500 transition-[stroke-dashoffset] duration-500 ease-out",
                indicatorClassName
              )}
              cx={center}
              cy={center}
              r={config.r}
              fill="none"
              strokeWidth={config.stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          {showValue && (
            <span className="absolute text-xs font-medium text-gray-700">
              {Math.round(percent)}%
            </span>
          )}
        </ProgressPrimitive.Root>
      );
    }

    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={clamped}
        max={max}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-gray-100",
          linearHeights[size],
          trackClassName,
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 rounded-full bg-primary-500 transition-transform duration-500 ease-out",
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - percent}%)` }}
        />
        {showValue && (
          <span className="sr-only">{Math.round(percent)}%</span>
        )}
      </ProgressPrimitive.Root>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

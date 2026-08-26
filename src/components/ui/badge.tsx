import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Badge — a small status/label pill.
 *
 * Replaces the ad-hoc `inline-flex rounded-full px-2 py-0.5 …` spans that were
 * duplicated across course cards, credential cards and the course filter bar.
 *
 * Colour is never the only carrier of meaning: every badge renders its label as
 * text, so a difficulty or status is legible without colour vision. The colour
 * pairs below are all light-tint backgrounds with 700-weight foregrounds, which
 * clear WCAG AA for normal text.
 */

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "beginner"
  | "intermediate"
  | "advanced";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary-100 text-primary-700",
  secondary: "bg-gray-100 text-gray-700",
  destructive: "bg-red-100 text-red-700",
  outline: "border border-gray-300 bg-transparent text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-800",
  // Difficulty levels, kept as named variants so call sites read as the domain
  // concept rather than a colour.
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-700",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";

/** Course difficulty levels the app models. */
export type Difficulty = "beginner" | "intermediate" | "advanced";

/**
 * Map a difficulty onto its badge variant.
 *
 * Exported so call sites do not re-implement the mapping, and falls back to
 * `secondary` rather than throwing if the API ever returns a level the UI does
 * not know about — an unknown difficulty should render plainly, not crash the
 * course list.
 */
export function difficultyVariant(difficulty: string): BadgeVariant {
  switch (difficulty) {
    case "beginner":
    case "intermediate":
    case "advanced":
      return difficulty;
    default:
      return "secondary";
  }
}

export { Badge };

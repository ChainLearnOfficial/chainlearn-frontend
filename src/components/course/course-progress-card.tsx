"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/course/progress-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Layers } from "lucide-react";

export interface CourseProgressCardProps {
  courseId: string;
  courseTitle: string;
  /** 0-100 completion percentage. */
  progress: number;
  completedModules?: number;
  moduleCount?: number;
  /** Optional href for the continue action. Defaults to the course detail page. */
  continueHref?: string;
  className?: string;
}

/**
 * Dedicated card for an enrolled course on the dashboard. Shows the course
 * title, an animated progress bar, module count and a quick continue action,
 * plus explicit completion status.
 */
export const CourseProgressCard = memo(function CourseProgressCard({
  courseId,
  courseTitle,
  progress,
  completedModules,
  moduleCount,
  continueHref,
  className,
}: CourseProgressCardProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const isComplete = clamped >= 100;

  return (
    <Card
      className={cn(
        "flex h-full flex-col transition-shadow hover:shadow-md",
        className
      )}
    >
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {courseTitle}
          </h3>
          <Badge
            variant={isComplete ? "success" : "secondary"}
            className="flex-shrink-0"
          >
            {isComplete ? "Completed" : "In Progress"}
          </Badge>
        </div>

        {moduleCount !== undefined && (
          <p className="mb-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            {completedModules !== undefined
              ? `${completedModules} of ${moduleCount} modules`
              : `${moduleCount} modules`}
          </p>
        )}

        <ProgressBar value={clamped} className="mb-4" />

        <div className="mt-auto">
          <Link href={continueHref ?? `/courses/${courseId}`} className="block">
            <Button variant="ghost" size="sm" className="w-full gap-1">
              {isComplete ? (
                <>
                  Review Course <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue Learning <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
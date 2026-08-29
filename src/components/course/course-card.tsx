"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge, difficultyVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/course/progress-bar";
import {
  Clock,
  Users,
  Star,
  MoreVertical,
  Share,
  Bookmark,
  PlayCircle,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Course } from "@/types/course";
import { formatDuration, capitalize, formatNumber } from "@/lib/utils/format";

interface CourseCardProps {
  course: Course;
  enrolled?: boolean;
  progress?: number;
  onEnroll?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
  className?: string;
}

export const CourseCard = memo(function CourseCard({
  course,
  enrolled,
  progress,
  onEnroll,
  onContinue,
  className,
}: CourseCardProps) {
  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    onEnroll?.(course.id);
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    onContinue?.(course.id);
  };

  return (
    <Link href={`/courses/${course.id}`}>
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
          className,
        )}
      >
        {/* Image placeholder with enrolled badge */}
        <div className="h-40 rounded-t-xl bg-gradient-to-br from-stellar-purple/20 to-stellar-blue/20 flex items-center justify-center relative overflow-hidden">
          <Star className="h-10 w-10 text-stellar-purple/40" />

          {/* Enrolled badge */}
          {enrolled && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-green-600 hover:bg-green-700 text-white animate-in fade-in slide-in-from-top-2 duration-300">
                ✓ Enrolled
              </Badge>
            </div>
          )}

          {/* Action buttons on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            {enrolled ? (
              <Button
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={handleContinue}
              >
                <PlayCircle className="h-4 w-4" />
                Continue
              </Button>
            ) : (
              <Button size="sm" className="gap-2" onClick={handleEnroll}>
                <Plus className="h-4 w-4" />
                Enroll
              </Button>
            )}
          </div>

          <div
            className="absolute top-2 right-2"
            onClick={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") e.preventDefault();
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Course options"
                  className="p-1.5 text-gray-500 hover:text-gray-900 bg-white/50 hover:bg-white/80 rounded-full transition-colors dark:text-gray-300 dark:hover:text-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-900/80"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share className="mr-2 h-4 w-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                {enrolled && (
                  <DropdownMenuItem>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Save</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={difficultyVariant(course.difficulty)}>
              {capitalize(course.difficulty)}
            </Badge>
            <span className="text-xs text-gray-500">
              {capitalize(course.category)}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 dark:text-gray-100 dark:group-hover:text-primary-300">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
            {course.description}
          </p>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex-col gap-3">
          <div className="flex items-center justify-between w-full text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(course.estimatedHours * 60)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {formatNumber(course.enrolledCount)}
              </span>
            </div>
            <span className="font-medium text-stellar-purple">
              +{formatNumber(course.rewardTokenAmount)} LEARN
            </span>
          </div>

          {/* Progress bar with percentage label */}
          {enrolled && progress !== undefined && (
            <div 
              className="w-full space-y-1 animate-in fade-in slide-in-from-top-2 duration-300"
              role="region"
              aria-label={`Course progress: ${Math.round(progress)}%`}
            >
              <div className="flex items-center justify-between" aria-hidden="true">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Progress
                </span>
                <span className="text-xs font-semibold text-stellar-purple">
                  {Math.round(progress)}%
                </span>
              </div>
              <ProgressBar value={progress} size="sm" />
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
});

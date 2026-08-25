"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/course/progress-bar";
import { Clock, Users, Star, MoreVertical, Share, Bookmark } from "lucide-react";
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
  className?: string;
}



export const CourseCard = memo(function CourseCard({
  course,
  enrolled,
  progress,
  className,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
          className
        )}
      >
        {/* Image placeholder */}
        <div className="h-40 rounded-t-xl bg-gradient-to-br from-stellar-purple/20 to-stellar-blue/20 flex items-center justify-center relative">
          <Star className="h-10 w-10 text-stellar-purple/40" />
          
          <div className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-gray-500 hover:text-gray-900 bg-white/50 hover:bg-white/80 rounded-full transition-colors">
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
            <Badge variant={course.difficulty as "beginner" | "intermediate" | "advanced"}>
              {capitalize(course.difficulty)}
            </Badge>
            <span className="text-xs text-gray-500">{capitalize(course.category)}</span>
          </div>

          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {course.description}
          </p>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          <div className="flex items-center justify-between w-full text-xs text-gray-500">
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

          {enrolled && progress !== undefined && (
            <div className="w-full mt-3">
              <ProgressBar value={progress} size="sm" />
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
});

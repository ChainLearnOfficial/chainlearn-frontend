"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, Users, Star } from "lucide-react";
import type { Course } from "@/types/course";
import { formatDuration } from "@/lib/utils/format";

interface CourseCardProps {
  course: Course;
  enrolled?: boolean;
  progress?: number;
  className?: string;
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export function CourseCard({
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
        <div className="h-40 rounded-t-xl bg-gradient-to-br from-stellar-purple/20 to-stellar-blue/20 flex items-center justify-center">
          <Star className="h-10 w-10 text-stellar-purple/40" />
        </div>

        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                difficultyColors[course.difficulty]
              )}
            >
              {course.difficulty}
            </span>
            <span className="text-xs text-gray-500">{course.category}</span>
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
                {course.enrolledCount}
              </span>
            </div>
            <span className="font-medium text-stellar-purple">
              +{course.rewardTokenAmount} LEARN
            </span>
          </div>

          {enrolled && progress !== undefined && (
            <div className="w-full mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

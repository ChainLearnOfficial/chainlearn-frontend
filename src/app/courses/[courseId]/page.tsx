"use client";

import { lazy, Suspense } from "react";
import { useCourseDetail, useCourses } from "@/lib/hooks/use-courses";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCourseStore } from "@/store/course-store";
import { ProgressBar } from "@/components/course/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useToastContext } from "@/components/shared/toast";
import {
  Clock,
  Users,
  BookOpen,
  Trophy,
  Star,
  Loader2,
} from "lucide-react";
import { formatDuration, capitalize } from "@/lib/utils/format";
import { useState } from "react";
import Link from "next/link";

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

// Deferred so the module list chunk streams in independently of the
// hero/enrollment section above it.
const ModuleList = lazy(() =>
  import("@/components/course/module-list").then((m) => ({
    default: m.ModuleList,
  }))
);

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = params;
  const { course, loading, error } = useCourseDetail(courseId);
  const { isAuthenticated } = useAuth();
  const { enroll } = useCourses();
  const enrollments = useCourseStore((s) => s.enrollments);
  const progress = useCourseStore((s) => s.progress);
  const { addToast } = useToastContext();
  const [enrolling, setEnrolling] = useState(false);

  const enrollment = enrollments.find((e) => e.courseId === courseId);
  const isEnrolled = !!enrollment;
  const courseProgress = progress[courseId];

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enroll(courseId);
      addToast("Successfully enrolled in the course!", "success");
    } catch (err) {
      console.error("Enrollment failed:", err);
      addToast("Enrollment failed. Please try again.", "error");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p role="alert" aria-live="polite" className="text-gray-500">
          {error || "Course not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              difficultyColors[course.difficulty]
            }`}
          >
            {capitalize(course.difficulty)}
          </span>
          <span className="text-xs text-gray-500">{capitalize(course.category)}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {course.title}
        </h1>
        <p className="text-gray-600 text-lg">{course.description}</p>

        <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {formatDuration(course.estimatedHours * 60)}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {course.totalModules} modules
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {course.enrolledCount} enrolled
          </span>
          <span className="flex items-center gap-1.5 text-stellar-purple font-medium">
            <Trophy className="h-4 w-4" />
            +{course.rewardTokenAmount} LEARN
          </span>
        </div>
      </div>

      {/* Enrollment / Progress */}
      {isEnrolled ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Your Progress</h2>
              <Link href={`/courses/${courseId}/quiz`}>
                <Button variant="outline" size="sm">
                  Take Quiz
                </Button>
              </Link>
            </div>
            <ProgressBar
              value={courseProgress?.progressPercent ?? 0}
              size="lg"
            />
          </CardContent>
        </Card>
      ) : isAuthenticated ? (
        <Card className="mb-8">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Ready to start learning?
              </h2>
              <p className="text-sm text-gray-500">
                Enroll to track your progress and earn rewards.
              </p>
            </div>
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enrolling...
                </>
              ) : (
                "Enroll Now"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Modules */}
      <Card>
        <CardContent className="p-6">
          <Suspense fallback={<LoadingSkeleton count={4} variant="text" />}>
            <ModuleList
              courseId={courseId}
              modules={course.modules}
              completedModuleIds={enrollment?.completedModules ?? []}
              currentModuleId={courseProgress?.currentModuleId}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

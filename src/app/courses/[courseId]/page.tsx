"use client";

import { lazy, Suspense } from "react";
import { useCourseDetail, useCourses } from "@/lib/hooks/use-courses";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCourseStore } from "@/store/course-store";
import { ProgressBar } from "@/components/course/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, difficultyVariant } from "@/components/ui/badge";
import { AutoBreadcrumb } from "@/components/ui/breadcrumb";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useToastContext } from "@/components/shared/toast";
import {
  Clock,
  Users,
  BookOpen,
  Trophy,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { formatDuration, capitalize } from "@/lib/utils/format";
import { useState } from "react";
import Link from "next/link";

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
  const [justEnrolled, setJustEnrolled] = useState(false);

  const enrollment = enrollments.find((e) => e.courseId === courseId);
  const isEnrolled = !!enrollment;
  const courseProgress = progress[courseId];

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enroll(courseId);
      setJustEnrolled(true);
      addToast("Successfully enrolled in the course!", "success");
      // Allow the success animation to play before transitioning to progress view
      setTimeout(() => setJustEnrolled(false), 1500);
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
        <p role="alert" aria-live="polite" className="text-gray-500 dark:text-gray-400">
          {error || "Course not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <AutoBreadcrumb
        className="mb-6"
        labels={{ [courseId]: course.title }}
      />

      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant={difficultyVariant(course.difficulty)}>
            {capitalize(course.difficulty)}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {capitalize(course.category)}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3 dark:text-gray-100">
          {course.title}
        </h1>
        <p className="text-gray-600 text-lg dark:text-gray-300">{course.description}</p>

        <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
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
      {isEnrolled && !justEnrolled ? (
        <Card className="mb-8 transition-all duration-300 ease-in-out">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Your Progress</h2>
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
      ) : justEnrolled ? (
        <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-2">
          <CardContent className="p-6 flex items-center justify-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 animate-in zoom-in duration-300" />
            <span className="font-semibold text-green-800 dark:text-green-200">
              Enrolled! Redirecting to your progress...
            </span>
          </CardContent>
        </Card>
      ) : isAuthenticated ? (
        <Card className="mb-8 transition-all duration-300 ease-in-out">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Ready to start learning?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enroll to track your progress and earn rewards.
              </p>
            </div>
            <Button
              onClick={handleEnroll}
              disabled={enrolling}
              className="transition-all duration-200"
            >
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

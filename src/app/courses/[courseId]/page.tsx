"use client";

import { use } from "react";
import { useCourseDetail } from "@/lib/hooks/use-courses";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCourseStore } from "@/store/course-store";
import { enrollInCourse } from "@/lib/api/courses";
import { ModuleList } from "@/components/course/module-list";
import { ProgressBar } from "@/components/course/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Clock,
  Users,
  BookOpen,
  Trophy,
  Star,
  Loader2,
} from "lucide-react";
import { formatDuration } from "@/lib/utils/format";
import { useState } from "react";
import Link from "next/link";

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { course, loading, error } = useCourseDetail(courseId);
  const { jwt, isAuthenticated } = useAuth();
  const enrollments = useCourseStore((s) => s.enrollments);
  const progress = useCourseStore((s) => s.progress);
  const [enrolling, setEnrolling] = useState(false);

  const isEnrolled = enrollments.some((e) => e.courseId === courseId);
  const courseProgress = progress[courseId];

  const handleEnroll = async () => {
    if (!jwt) return;
    setEnrolling(true);
    try {
      await enrollInCourse(courseId, jwt);
      useCourseStore.getState().enroll({
        id: "",
        courseId,
        userId: "",
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedModules: [],
        lastAccessedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Enrollment failed:", err);
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
        <p className="text-gray-500">{error || "Course not found."}</p>
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
            {course.difficulty}
          </span>
          <span className="text-xs text-gray-500">{course.category}</span>
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
          <ModuleList
            courseId={courseId}
            modules={course.modules}
            completedModuleIds={[]}
            currentModuleId={courseProgress?.currentModuleId}
          />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import DOMPurify from "dompurify";
import { useModule, useCourseDetail } from "@/lib/hooks/use-courses";
import { parseModuleContent } from "@/lib/api/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { BackButton } from "@/components/shared/back-button";
import { ProgressBar } from "@/components/course/progress-bar";
import { useCourseStore } from "@/store/course-store";
import { useToastContext } from "@/components/shared/toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ModulePage({
  params,
}: {
  params: { courseId: string; moduleId: string };
}) {
  const { courseId, moduleId } = params;
  const { module, loading, error, complete } = useModule(courseId, moduleId);
  const { course } = useCourseDetail(courseId);
  const courseProgress = useCourseStore((s) => s.progress[courseId]);
  const enrollment = useCourseStore((s) =>
    s.enrollments.find((item) => item.courseId === courseId)
  );
  const { addToast } = useToastContext();
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const sortedModules = course
    ? [...course.modules].sort((a, b) => a.order - b.order)
    : [];
  const currentIndex = sortedModules.findIndex((m) => m.id === moduleId);
  const prevModule =
    currentIndex > 0 ? sortedModules[currentIndex - 1] : null;
  const nextModule =
    currentIndex >= 0 && currentIndex < sortedModules.length - 1
      ? sortedModules[currentIndex + 1]
      : null;
  const isComplete =
    completed ||
    Boolean(module?.isCompleted) ||
    Boolean(enrollment?.completedModules.includes(moduleId));

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await complete();
      setCompleted(true);
      addToast("Module marked as complete!", "success");
    } catch (err) {
      console.error("Failed to mark complete:", err);
      addToast("Failed to mark module as complete.", "error");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <LoadingSkeleton count={5} variant="text" />
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p role="alert" aria-live="polite" className="text-gray-500">
          {error || "Module not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <BackButton />

      {/* Progress */}
      {courseProgress && (
        <div className="mb-6">
          <ProgressBar value={courseProgress.progressPercent} size="sm" />
        </div>
      )}

      {/* Module Content */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">
            {module.title}
          </h1>
          <p className="text-gray-500 mb-6 dark:text-gray-400">{module.description}</p>

          <div className="prose prose-gray max-w-none dark:prose-invert">
            {module.contentType === "video" ? (
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden flex items-center justify-center mb-6">
                {(parseModuleContent(module) as any).url ? (
                  <video src={(parseModuleContent(module) as any).url} controls className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-500 flex flex-col items-center">
                    <PlayCircle className="h-12 w-12 mb-2 opacity-50" />
                    Video Content
                  </div>
                )}
              </div>
            ) : module.contentType === "interactive" ? (
              <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center mb-6">
                <CheckCircle className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interactive Challenge</h3>
                <p className="text-gray-500 dark:text-gray-400">Complete the interactive task to proceed.</p>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((parseModuleContent(module) as any).body || module.content as string) }} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            All Modules
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {prevModule && (
            <Link href={`/courses/${courseId}/modules/${prevModule.id}`}>
              <Button variant="ghost" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            </Link>
          )}

          {isComplete ? (
            nextModule ? (
              <Link href={`/courses/${courseId}/modules/${nextModule.id}`}>
                <Button className="gap-1">
                  Next Module
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href={`/courses/${courseId}/quiz`}>
                <Button className="gap-1 bg-stellar-purple hover:bg-stellar-purple/90">
                  <CheckCircle className="h-4 w-4" />
                  Take Quiz
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )
          ) : (
            <Button onClick={handleComplete} disabled={completing} className="gap-1">
              {completing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Mark as Complete
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

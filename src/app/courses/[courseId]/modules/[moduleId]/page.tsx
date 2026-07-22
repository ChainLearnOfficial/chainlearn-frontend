"use client";

import { use } from "react";
import DOMPurify from "dompurify";
import { useModule } from "@/lib/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ProgressBar } from "@/components/course/progress-bar";
import { useCourseStore } from "@/store/course-store";
import { useToastContext } from "@/components/shared/toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { courseId, moduleId } = use(params);
  const { module, loading, error, complete } = useModule(courseId, moduleId);
  const courseProgress = useCourseStore((s) => s.progress[courseId]);
  const { addToast } = useToastContext();
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

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
        <p className="text-gray-500">{error || "Module not found."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/courses/${courseId}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
      </div>

      {/* Progress */}
      {courseProgress && (
        <div className="mb-6">
          <ProgressBar value={courseProgress.progressPercent} size="sm" />
        </div>
      )}

      {/* Module Content */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {module.title}
          </h1>
          <p className="text-gray-500 mb-6">{module.description}</p>

          <div className="prose prose-gray max-w-none">
            {/* Render module content. In production, use a proper MD renderer. */}
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(module.content) }} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            All Modules
          </Button>
        </Link>

        {completed ? (
          <Link href={`/courses/${courseId}`}>
            <Button className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
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
  );
}

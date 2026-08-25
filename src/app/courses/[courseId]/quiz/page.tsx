"use client";

import { lazy, Suspense } from "react";
import { useQuiz } from "@/lib/hooks/use-quiz";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { submitQuiz } from "@/lib/api/quizzes";
import { useToastContext } from "@/components/shared/toast";

// Deferred so the interactive quiz chunk streams in after the page shell.
const QuizInterface = lazy(() =>
  import("@/components/course/quiz-interface").then((m) => ({
    default: m.QuizInterface,
  }))
);

export default function QuizPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = params;
  const jwt = useAuthStore((s) => s.jwt);
  const { quiz, loading, error } = useQuiz(courseId);
  const { addToast } = useToastContext();

  const handleSubmit = async (answers: Record<string, string>) => {
    if (!quiz || !jwt) throw new Error("Not ready");
    try {
      const result = await submitQuiz(
        {
          quizId: quiz.id,
          answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
          })),
        },
        jwt
      );
      addToast("Quiz submitted successfully!", "success");
      return result;
    } catch (err) {
      addToast("Quiz submission failed. Please try again.", "error");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p role="alert" aria-live="polite" className="text-gray-500">
          {error || "Quiz not found."}
        </p>
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" className="mt-4">
            Back to Course
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/courses/${courseId}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
      </div>

      <Suspense fallback={<LoadingSkeleton count={3} />}>
        <QuizInterface quiz={quiz} onSubmit={handleSubmit} />
      </Suspense>
    </div>
  );
}

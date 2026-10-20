"use client";

import { lazy, Suspense, useState, useCallback } from "react";
import { useQuiz } from "@/lib/hooks/use-quiz";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { BackButton } from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { submitQuiz, generateQuiz } from "@/lib/api/quizzes";
import { useToastContext } from "@/components/shared/toast";
import type { QuizAttempt } from "@/types/quiz";

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
  const [attemptKey, setAttemptKey] = useState(0);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!jwt) {
      addToast("You must be logged in to generate a quiz.", "error");
      return;
    }
    setGenerating(true);
    try {
      await generateQuiz({ courseId }, jwt);
      addToast("Quiz generated successfully! Reloading...", "success");
      window.location.reload();
    } catch (err) {
      console.error(err);
      addToast("Failed to generate quiz. Please try again.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (answers: Record<string, string>): Promise<QuizAttempt> => {
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

  const handleRetry = useCallback(() => {
    setAttemptKey((k) => k + 1);
  }, []);

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quiz Not Found</h2>
        <p className="text-gray-500 mb-6">
          There is no quiz generated for this course yet.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate AI Quiz"
            )}
          </Button>
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline">
              Back to Course
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BackButton />

      <Suspense fallback={<LoadingSkeleton count={3} />}>
        <QuizInterface
          key={attemptKey}
          quiz={quiz}
          courseId={courseId}
          onSubmit={handleSubmit}
          onRetry={handleRetry}
        />
      </Suspense>
    </div>
  );
}

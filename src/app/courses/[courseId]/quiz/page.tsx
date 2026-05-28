"use client";

import { use } from "react";
import { useQuiz } from "@/lib/hooks/use-quiz";
import { QuizInterface } from "@/components/course/quiz-interface";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { submitQuiz } from "@/lib/api/quizzes";

export default function QuizPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const jwt = useAuthStore((s) => s.jwt);
  const { quiz, loading, error } = useQuiz(courseId);

  const handleSubmit = async (answers: Record<string, string>) => {
    if (!quiz || !jwt) throw new Error("Not ready");
    return submitQuiz(
      {
        quizId: quiz.id,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      },
      jwt
    );
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
        <p className="text-gray-500">{error || "Quiz not found."}</p>
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

      <QuizInterface quiz={quiz} onSubmit={handleSubmit} />
    </div>
  );
}

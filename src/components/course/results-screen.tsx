"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCourseStore } from "@/store/course-store";
import {
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  Coins,
  BookOpen,
} from "lucide-react";
import type { Quiz, QuizAttempt } from "@/types/quiz";

export interface ResultsScreenProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  courseId: string;
  onRetry: () => void;
  className?: string;
}

export function ResultsScreen({
  quiz,
  attempt,
  courseId,
  onRetry,
  className,
}: ResultsScreenProps) {
  const router = useRouter();
  const currentCourse = useCourseStore((s) => s.currentCourse);

  // Derive the next module after the one this quiz belongs to
  const sortedModules = currentCourse
    ? [...currentCourse.modules].sort((a, b) => a.order - b.order)
    : [];
  const quizModuleIndex = sortedModules.findIndex((m) => m.id === quiz.moduleId);
  const nextModule =
    quizModuleIndex >= 0 && quizModuleIndex < sortedModules.length - 1
      ? sortedModules[quizModuleIndex + 1]
      : null;

  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const totalCount = quiz.questions.length;

  const scoreColor = attempt.passed
    ? "stroke-green-500"
    : attempt.score >= quiz.passingScore * 0.8
      ? "stroke-amber-500"
      : "stroke-red-500";

  const scoreTextColor = attempt.passed
    ? "text-green-600 dark:text-green-400"
    : attempt.score >= quiz.passingScore * 0.8
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <Card
      className={cn("max-w-2xl mx-auto", className)}
      aria-live="polite"
      aria-label="Quiz results"
    >
      {/* ── Hero ── */}
      <CardHeader className="text-center pb-4 pt-8">
        {/* Trophy icon — bounces on pass */}
        <div
          className={cn(
            "mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full",
            attempt.passed
              ? "bg-green-50 dark:bg-green-900/20"
              : "bg-gray-100 dark:bg-gray-800"
          )}
        >
          <Trophy
            className={cn(
              "h-10 w-10 transition-transform",
              attempt.passed ? "text-green-500 animate-bounce" : "text-gray-400 dark:text-gray-500"
            )}
            aria-hidden="true"
          />
        </div>

        {/* Pass / fail badge */}
        <div className="flex justify-center mb-3">
          <Badge
            variant={attempt.passed ? "success" : "destructive"}
            className="text-sm px-3 py-1"
          >
            {attempt.passed ? "Passed" : "Failed"}
          </Badge>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {attempt.passed ? "Well done!" : "Keep going!"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {attempt.passed
            ? "You cleared the passing threshold. Check your results below."
            : `You need ${quiz.passingScore}% to pass. Review the feedback and try again.`}
        </p>

        {/* Score ring */}
        <div className="mt-6 flex flex-col items-center gap-1">
          {/* Use a custom ring so we can size it prominently */}
          <div className="relative flex items-center justify-center">
            <Progress
              variant="circular"
              size="lg"
              value={attempt.score}
              indicatorClassName={scoreColor}
              className="h-28 w-28"
              aria-label={`Score: ${attempt.score}%`}
            />
            {/* Overlay percentage — Progress showValue renders at text-xs; we override with a larger label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={cn("text-2xl font-bold tabular-nums", scoreTextColor)}>
                {attempt.score}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {correctCount} / {totalCount} correct
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Passing score: {quiz.passingScore}%
          </p>
        </div>

        {/* Token reward banner */}
        {attempt.passed && attempt.rewardClaimed && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 px-4 py-3">
            <Coins className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              +{quiz.rewardTokenAmount} LEARN tokens sent to your wallet
            </p>
          </div>
        )}
      </CardHeader>

      <Separator />

      {/* ── Per-question feedback ── */}
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Question breakdown
        </h3>

        <ScrollArea className="h-[min(22rem,55vh)] pr-2">
          <div className="space-y-3">
            {quiz.questions.map((q, i) => {
              const answer = attempt.answers.find((a) => a.questionId === q.id);
              const selectedOption = q.options.find(
                (o) => o.id === answer?.selectedOptionId
              );
              const correctOption = q.options.find(
                (o) => o.id === q.correctOptionId
              );

              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-lg border p-4",
                    answer?.isCorrect
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                  )}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-2 mb-2">
                    {answer?.isCorrect ? (
                      <CheckCircle
                        className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5"
                        aria-label="Correct"
                      />
                    ) : (
                      <XCircle
                        className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"
                        aria-label="Incorrect"
                      />
                    )}
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {i + 1}. {q.text}
                    </p>
                  </div>

                  {/* Answer comparison */}
                  <div className="ml-6 space-y-1 text-xs">
                    {answer?.isCorrect ? (
                      selectedOption && (
                        <p className="text-green-700 dark:text-green-400">
                          <span className="font-medium">Your answer: </span>
                          {selectedOption.text}
                        </p>
                      )
                    ) : (
                      <>
                        {selectedOption && (
                          <p className="text-red-700 dark:text-red-400">
                            <span className="font-medium">Your answer: </span>
                            {selectedOption.text}
                          </p>
                        )}
                        {correctOption && (
                          <p className="text-green-700 dark:text-green-400">
                            <span className="font-medium">Correct answer: </span>
                            {correctOption.text}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-gray-500 dark:text-gray-400 pt-1 italic leading-relaxed">
                            {q.explanation}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* ── Action buttons ── */}
      <CardFooter className="flex flex-col gap-3 p-4 sm:p-6">
        {attempt.passed ? (
          <>
            {/* Primary CTA: continue to next module or back to course */}
            {nextModule ? (
              <Button
                className="w-full gap-2"
                onClick={() =>
                  router.push(`/courses/${courseId}/modules/${nextModule.id}`)
                }
              >
                Continue to next module
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button className="w-full gap-2" asChild>
                <Link href={`/courses/${courseId}`}>
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Back to course
                </Link>
              </Button>
            )}

            {/* Secondary: back to course page when a next module exists */}
            {nextModule && (
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/courses/${courseId}`}>Back to course</Link>
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Primary: retry */}
            <Button className="w-full gap-2" onClick={onRetry}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>

            {/* Secondary: back to course */}
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/courses/${courseId}`}>Back to course</Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

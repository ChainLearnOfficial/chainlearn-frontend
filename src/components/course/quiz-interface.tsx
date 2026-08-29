"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ResultsScreen } from "@/components/course/results-screen";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import type { Quiz, QuizAttempt } from "@/types/quiz";

interface QuizInterfaceProps {
  quiz: Quiz;
  courseId: string;
  onSubmit: (answers: Record<string, string>) => Promise<QuizAttempt>;
  onRetry?: () => void;
  className?: string;
}

export function QuizInterface({ quiz, courseId, onSubmit, onRetry, className }: QuizInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions = quiz.questions;
  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  if (!question) {
    return (
      <EmptyState
        className={cn("max-w-2xl mx-auto", className)}
        title="No Questions"
        description="This quiz has no questions yet."
      />
    );
  }

  const selectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await onSubmit(answers);
      setAttempt(result);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setAttempt(null);
    setCurrentIndex(0);
    setSubmitError(null);
    // Delegate to parent if provided (remounts via key); otherwise local reset suffices.
    onRetry?.();
  };

  // ── Results view ──────────────────────────────────────────────────────────
  if (attempt) {
    return (
      <ResultsScreen
        quiz={quiz}
        attempt={attempt}
        courseId={courseId}
        onRetry={handleRetry}
        className={className}
      />
    );
  }

  // ── Question view ─────────────────────────────────────────────────────────
  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {quiz.title}
          </CardTitle>
          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
            {quiz.timeLimitMinutes && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {quiz.timeLimitMinutes}m
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 mt-3"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-label={`Question ${currentIndex + 1} of ${questions.length}`}
        >
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question dot navigation */}
        <div
          className="flex items-center gap-1.5 flex-wrap mt-3"
          role="tablist"
          aria-label="Question navigation"
        >
          {questions.map((q, i) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ""}`}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  isCurrent
                    ? "bg-primary-500 scale-125"
                    : isAnswered
                      ? "bg-primary-300 dark:bg-primary-700 hover:bg-primary-400"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              />
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-6 pt-2 sm:pt-2">
        {/* Question counter + text */}
        <div aria-live="polite">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-snug">
            {question.text}
          </p>
        </div>

        {/* Answer options */}
        <div className="space-y-2" role="radiogroup" aria-label={question.text}>
          {question.options.map((option) => {
            const isSelected = answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => selectOption(question.id, option.id)}
                className={cn(
                  "w-full text-left rounded-lg border px-4 py-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  isSelected
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-200"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:border-gray-600 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
              >
                <span className="text-sm">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Submission error */}
        {submitError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {submitError}
          </p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="gap-1"
            aria-label="Previous question"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="gap-1 min-w-[120px]"
              aria-label={allAnswered ? "Submit quiz" : "Answer all questions to submit"}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Submitting...
                </>
              ) : (
                "Submit Quiz"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={!answers[question.id]}
              className="gap-1"
              aria-label="Next question"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

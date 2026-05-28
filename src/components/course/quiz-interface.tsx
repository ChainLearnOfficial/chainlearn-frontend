"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, ChevronRight, Trophy } from "lucide-react";
import type { Quiz, QuizAttempt, QuizQuestion } from "@/types/quiz";

interface QuizInterfaceProps {
  quiz: Quiz;
  onSubmit: (answers: Record<string, string>) => Promise<QuizAttempt>;
  className?: string;
}

export function QuizInterface({ quiz, onSubmit, className }: QuizInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const question = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;
  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  const selectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await onSubmit(answers);
      setAttempt(result);
    } catch (err) {
      console.error("Quiz submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Results view
  if (attempt) {
    return (
      <Card className={cn("max-w-2xl mx-auto", className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-stellar-purple/10 to-stellar-blue/10">
            <Trophy
              className={cn(
                "h-8 w-8",
                attempt.passed ? "text-green-500" : "text-red-500"
              )}
            />
          </div>
          <CardTitle className="text-2xl">
            {attempt.passed ? "Congratulations!" : "Keep Trying!"}
          </CardTitle>
          <p className="text-gray-500">
            You scored {attempt.score}% on this quiz
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.questions.map((q, i) => {
            const answer = attempt.answers.find((a) => a.questionId === q.id);
            return (
              <div
                key={q.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {i + 1}. {q.text}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  {answer?.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      answer?.isCorrect ? "text-green-700" : "text-red-700"
                    }
                  >
                    {answer?.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                {!answer?.isCorrect && (
                  <p className="text-xs text-gray-500 mt-2">{q.explanation}</p>
                )}
              </div>
            );
          })}

          {attempt.passed && attempt.rewardClaimed && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-sm font-medium text-green-700">
                +{quiz.rewardTokenAmount} LEARN tokens have been sent to your
                wallet!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Question view
  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm font-medium text-primary-600">
            {quiz.title}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-primary-500 transition-all"
            style={{
              width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-medium text-gray-900">{question.text}</p>

        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => selectOption(question.id, option.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-4 transition-all",
                  isSelected
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <span className="text-sm">{option.text}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={!answers[question.id]}
              className="gap-1"
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

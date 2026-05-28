"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getQuiz, submitQuiz, getQuizAttempts } from "@/lib/api/quizzes";
import type { Quiz, QuizAttempt, QuizSubmission } from "@/types/quiz";

export function useQuiz(courseId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getQuiz(courseId, jwt ?? undefined)
      .then(setQuiz)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load quiz")
      )
      .finally(() => setLoading(false));
  }, [courseId, jwt]);

  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  const submit = useCallback(async () => {
    if (!quiz || !jwt) return;
    setSubmitting(true);
    setError(null);

    const submission: QuizSubmission = {
      quizId: quiz.id,
      answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })),
    };

    try {
      const result = await submitQuiz(submission, jwt);
      setAttempt(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [quiz, jwt, answers]);

  const reset = useCallback(() => {
    setAnswers({});
    setAttempt(null);
    setError(null);
  }, []);

  return {
    quiz,
    loading,
    error,
    answers,
    attempt,
    submitting,
    selectAnswer,
    submit,
    reset,
  };
}

export function useQuizAttempts(quizId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId || !jwt) {
      setLoading(false);
      return;
    }
    getQuizAttempts(quizId, jwt)
      .then(setAttempts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId, jwt]);

  return { attempts, loading };
}

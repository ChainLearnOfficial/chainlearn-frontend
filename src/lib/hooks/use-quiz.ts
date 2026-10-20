"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getQuiz } from "@/lib/api/quizzes";
import { isAbortError } from "@/lib/api/client";
import type { Quiz } from "@/types/quiz";

export function useQuiz(courseId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = useCallback(() => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    getQuiz(courseId, jwt ?? undefined)
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    getQuiz(courseId, jwt ?? undefined, controller.signal)
      .then(setQuiz)
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [courseId, jwt]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return {
    quiz,
    loading,
    error,
    refetch: fetchQuiz,
  };
}

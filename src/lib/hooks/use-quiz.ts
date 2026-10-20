"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getQuiz } from "@/lib/api/quizzes";
import { isAbortError } from "@/lib/api/client";
import type { Quiz } from "@/types/quiz";

export function useQuiz(courseId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    quiz,
    loading,
    error,
  };
}

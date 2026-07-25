"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getQuiz } from "@/lib/api/quizzes";
import type { Quiz } from "@/types/quiz";

export function useQuiz(courseId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    quiz,
    loading,
    error,
  };
}

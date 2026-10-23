"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getQuiz } from "@/lib/api/quizzes";
import { isAbortError } from "@/lib/api/client";
import type { Quiz } from "@/types/quiz";

export function useQuiz(courseId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // #487 — ref-based trigger so refetch() can force a re-read without the
  // useEffect depending on the callback identity (which would loop).
  const [fetchTick, setFetchTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    setFetchTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      setError(null);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    getQuiz(courseId, jwt ?? undefined, controller.signal)
      .then(setQuiz)
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [courseId, jwt, fetchTick]);

  return {
    quiz,
    loading,
    error,
    refetch,
  };
}

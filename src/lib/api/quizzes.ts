import { apiClient } from "./client";
import type {
  Quiz,
  QuizAttempt,
  QuizResult,
  QuizSubmission,
} from "@/types/quiz";

/**
 * Fetch a quiz for a given course and module.
 */
export async function getQuiz(
  courseId: string,
  jwt?: string,
  signal?: AbortSignal
): Promise<Quiz> {
  const response = await apiClient.get<Quiz>(
    `/courses/${courseId}/quiz`,
    jwt,
    signal
  );
  return response.data;
}

/**
 * Submit quiz answers and receive a score.
 *
 * The response is a fully populated attempt record. The declared return
 * type is `QuizResult` (alias for `QuizAttempt`) so call sites read as
 * "the outcome of a submission" rather than "a past attempt record".
 * Issue #310.
 */
export async function submitQuiz(
  submission: QuizSubmission,
  jwt: string,
  signal?: AbortSignal
): Promise<QuizResult> {
  const response = await apiClient.post<QuizResult>(
    `/quizzes/${submission.quizId}/submit`,
    submission,
    jwt,
    signal
  );
  return response.data;
}

/**
 * Fetch the user's past quiz attempts for a quiz.
 */
export async function getQuizAttempts(
  quizId: string,
  jwt: string,
  signal?: AbortSignal
): Promise<QuizAttempt[]> {
  const response = await apiClient.get<QuizAttempt[]>(
    `/quizzes/${quizId}/attempts`,
    jwt,
    signal
  );
  return response.data;
}

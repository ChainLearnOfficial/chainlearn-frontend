import { apiClient } from "./client";
import type {
  Quiz,
  QuizAttempt,
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
 */
export async function submitQuiz(
  submission: QuizSubmission,
  jwt: string,
  signal?: AbortSignal
): Promise<QuizAttempt> {
  const response = await apiClient.post<QuizAttempt>(
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

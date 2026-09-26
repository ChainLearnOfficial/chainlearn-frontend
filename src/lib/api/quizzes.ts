import { apiClient } from "./client";
import { getValidToken } from "./auth";
import type {
  Quiz,
  QuizAttempt,
  QuizResult,
  QuizSubmission,
} from "@/types/quiz";

/**
 * Fetch a quiz for a given course.
 * 
 * @param courseId - The course ID
 * @param jwt - Optional JWT token for authenticated requests
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Quiz with all questions and configuration
 * 
 * @throws {ApiError} When the request fails or quiz is not found
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
 * Generate a quiz for a module via the AI service.
 * 
 * @param moduleId - The module ID to generate the quiz for
 * @param jwt - JWT token for authenticated user
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Generated Quiz with questions
 * 
 * @throws {ApiError} When the request fails
 * @throws {Error} When user is not authenticated
 */
export async function generateQuiz(
  moduleId: string,
  jwt: string,
  signal?: AbortSignal
): Promise<Quiz> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.post<Quiz>(
    "/quizzes/generate",
    { moduleId },
    token,
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
 * Submit quiz answers and receive a score with feedback.
 * 
 * @param submission - Quiz submission with answers
 * @param jwt - JWT token for authenticated user
 * @param signal - Optional AbortSignal for request cancellation
 * @returns QuizAttempt with score, correctness, and feedback
 * 
 * @throws {ApiError} When the request fails or submission is invalid
 * @throws {Error} When user is not authenticated
 */
export async function submitQuiz(
  submission: QuizSubmission,
  jwt: string,
  signal?: AbortSignal
): Promise<QuizResult> {
  const response = await apiClient.post<QuizResult>(
): Promise<QuizAttempt> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.post<QuizAttempt>(
    `/quizzes/${submission.quizId}/submit`,
    submission,
    token,
    signal
  );
  return response.data;
}

/**
 * Fetch the user's past quiz attempts for a specific quiz.
 * 
 * @param quizId - The quiz ID
 * @param jwt - JWT token for authenticated user
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Array of past quiz attempts with scores
 * 
 * @throws {ApiError} When the request fails
 * @throws {Error} When user is not authenticated
 */
export async function getQuizAttempts(
  quizId: string,
  jwt: string,
  signal?: AbortSignal
): Promise<QuizAttempt[]> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<QuizAttempt[]>(
    `/quizzes/${quizId}/attempts`,
    token,
    signal
  );
  return response.data;
}

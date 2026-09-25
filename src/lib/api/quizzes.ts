import { apiClient } from "./client";
import { getValidToken } from "./auth";
import type {
  Quiz,
  QuizAttempt,
  QuizSubmission,
} from "@/types/quiz";

/** Parameters for AI-powered quiz generation. */
export interface GenerateQuizParams {
  /** Course ID to generate a quiz for. */
  courseId: string;
  /** Optional module ID to scope questions to. */
  moduleId?: string;
  /** Number of questions to generate (default 10). */
  questionCount?: number;
  /** Question types to include. */
  questionTypes?: ("multiple-choice" | "true-false" | "code")[];
}

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
 * Generate a quiz for a course via the AI service (#321).
 *
 * Calls `POST /api/v1/quizzes/generate` to produce a quiz with questions
 * tailored to the course content. The generation may take several seconds
 * depending on course complexity.
 *
 * @param params - Quiz generation parameters
 * @param jwt - JWT token for authenticated user
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Generated quiz with questions, options, and configuration
 *
 * @throws {ApiError} When the request fails or generation is not possible
 * @throws {Error} When user is not authenticated
 */
export async function generateQuiz(
  params: GenerateQuizParams,
  jwt: string,
  signal?: AbortSignal
): Promise<Quiz> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.post<Quiz>(
    "/quizzes/generate",
    params,
    token,
    signal
  );
  return response.data;
}

/**
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

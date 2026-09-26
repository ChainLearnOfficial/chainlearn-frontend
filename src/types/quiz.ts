export interface Quiz {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  rewardTokenAmount: number;
  timeLimitMinutes?: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: "multiple-choice" | "true-false" | "code";
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuizAnswer[];
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  rewardClaimed: boolean;
  feedback?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface QuizSubmission {
  quizId: string;
  answers: { questionId: string; selectedOptionId: string }[];
}

export interface GenerateQuizRequest {
  courseId: string;
  moduleId: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  questionCount?: number;
}

export interface SubmitQuizRequest {
  quizId: string;
  userId: string;
  answers: { questionId: string; selectedOptionId: string }[];
  timeTakenSeconds?: number;
}

export interface QuizResult {
  quizId: string;
  userId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenSeconds?: number;
  answers: QuizAnswer[];
  rewardEarned?: number;
}

export interface QuizFeedback {
  questionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
}

export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  passRate: number; // percentage
  averageTimeSeconds?: number;
}
/**
 * Result returned by the quiz-submit endpoint. Semantically distinct from
 * `QuizAttempt` (which is the persisted-attempt record used across list /
 * detail views), but structurally identical: the submit endpoint returns
 * the same attempt record with `score`, `passed`, and per-question
 * `answers` populated. Named separately so call sites reading a submit
 * response can express intent without importing the storage-side name.
 * Issue #310.
 */
export type QuizResult = QuizAttempt;

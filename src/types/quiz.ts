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

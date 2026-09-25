/**
 * Centralized API exports for easy importing.
 * 
 * @example
 * import { getCourses, getModule, submitQuiz } from '@/lib/api';
 */

// Course-related APIs
export {
  getCourses,
  getCourse,
  getModule,
  getModuleContent,
  getCourseModules,
  getModuleBatch,
  enrollInCourse,
  markModuleComplete,
  getEnrollments,
  getRecommendedCourses,
  type GetCoursesParams,
} from "./courses";

// Quiz-related APIs
export {
  getQuiz,
  submitQuiz,
  getQuizAttempts,
} from "./quizzes";

// Auth-related APIs
export {
  getChallenge,
  verifySignature,
  getProfile,
  updateProfile,
  refreshToken,
  getValidToken,
  getSessions,
  revokeSession,
} from "./auth";

// Credential-related APIs
export {
  getCredentials,
  getCredential,
  verifyCredential,
  mintCredential,
} from "./credentials";

// Reward-related APIs
export {
  getTokenBalances,
  getRewardHistory,
  claimReward,
  getClaimables,
} from "./rewards";

// Notification-related APIs
export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notifications";

// API Client utilities
export {
  apiClient,
  isAbortError,
  createLoggingInterceptor,
  createAnalyticsInterceptor,
  type ResponseInterceptor,
} from "./client";

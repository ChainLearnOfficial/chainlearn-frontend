export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  estimatedHours: number;
  modules: Module[];
  totalModules: number;
  enrolledCount: number;
  rewardTokenAmount: number;
  imageUrl?: string;
  createdAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  contentType: "text" | "video" | "interactive";
  content: string;
  estimatedMinutes: number;
  isCompleted?: boolean;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  progress: number; // 0-100
  completedModules: string[];
  lastAccessedAt: string;
}

export interface CourseProgress {
  courseId: string;
  totalModules: number;
  completedModules: number;
  completedModuleIds: string[];
  progressPercent: number;
  currentModuleId?: string;
}

export interface RecommendedCourse extends Course {
  matchScore: number;
  matchReason: string;
}

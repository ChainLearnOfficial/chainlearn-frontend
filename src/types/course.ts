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

export interface ModuleContent {
  text?: string;
  videoUrl?: string;
  interactiveData?: Record<string, unknown>;
  duration?: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  contentType: "text" | "video" | "interactive";
  content: string | ModuleContent;
  estimatedMinutes: number;
  isCompleted?: boolean;
}

export type EnrollmentStatus = "not_enrolled" | "active" | "completed" | "dropped";

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  progress: number; // 0-100
  status: EnrollmentStatus;
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
  status: EnrollmentStatus;
  startedAt: string;
  lastAccessedAt: string;
}

export interface RecommendedCourse extends Course {
  matchScore: number;
  matchReason: string;
}

export interface CourseResponse {
  course: Course;
  progress?: CourseProgress;
  enrollment?: CourseEnrollment;
}

export interface CoursesListResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

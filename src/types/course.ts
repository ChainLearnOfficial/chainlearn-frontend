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

// #498 — Content payload union: text is markdown/HTML string, video is a URL,
// interactive is a config object. This replaces the previous `content: string`
// which forced casting in parseModuleContent.
export type ModuleContent =
  | string // text/markdown content
  | { type: "video"; url: string; duration?: number }
  | { type: "interactive"; config: Record<string, unknown> };


export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  contentType: "text" | "video" | "interactive";
  content: ModuleContent;
  content: string | ModuleContent;
  estimatedMinutes: number;
  isCompleted?: boolean;
}

// #498 — Type guard for Module.content
export function isTextContent(content: ModuleContent): content is string {
  return typeof content === "string";
}

export function isVideoContent(
  content: ModuleContent
): content is { type: "video"; url: string; duration?: number } {
  return typeof content === "object" && content !== null && "type" in content && content.type === "video";
}

export function isInteractiveContent(
  content: ModuleContent
): content is { type: "interactive"; config: Record<string, unknown> } {
  return typeof content === "object" && content !== null && "type" in content && content.type === "interactive";
}

// #498 — Safe parser that returns string content or empty string
export function parseModuleContent(content: ModuleContent): string {
  if (isTextContent(content)) return content;
  if (isVideoContent(content)) return content.url;
  return "";
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  progress: number; // 0-100
  completedModules: string[];
  lastAccessedAt: string;
  /**
   * Lifecycle state of this enrollment. Optional so responses that only
   * carry the numeric `progress` still type-check; consumers that need
   * status can derive it from `progress` when the field is absent.
   * Issue #310.
   */
  status?: EnrollmentStatus;
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
/**
 * Structured module content, discriminated by `type` to match the
 * `Module.contentType` field. The API currently sends `Module.content` as
 * an opaque string interpreted per `contentType`; the `parseModuleContent`
 * helper in `src/lib/api/courses.ts` promotes that raw shape into this
 * union so consumers can narrow instead of stringly typing on
 * `contentType`. Issue #310.
 */
export type ModuleContent =
  | { type: "text"; body: string }
  | { type: "video"; url: string; durationSeconds?: number; posterUrl?: string }
  | { type: "interactive"; challengeId: string; instructions?: string };

/**
 * Lifecycle state of a user's relationship to a course. Kept as a
 * string-literal union so it can be widened without a breaking API change,
 * and so response shapes that omit the field simply resolve to `undefined`
 * on `CourseEnrollment.status`. Issue #310.
 */
export type EnrollmentStatus =
  | "not_enrolled"
  | "enrolled"
  | "in_progress"
  | "completed"
  | "expired";

/**
 * Response shape of the "mark module complete" endpoint. Hoisted out of
 * the inline `{ success: boolean }` return so every API function in
 * `src/lib/api/courses.ts` has a named response type (Issue #310
 * acceptance criterion: "All API responses have types").
 */
export interface ModuleCompletionResult {
  success: boolean;
}

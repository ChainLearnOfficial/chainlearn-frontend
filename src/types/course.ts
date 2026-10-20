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

import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Course,
  CourseEnrollment,
  Module,
  ModuleCompletionResult,
  ModuleContent,
  RecommendedCourse,
} from "@/types/course";

export interface GetCoursesParams {
  category?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
  pageSize?: number;
  cursor?: string;
}

/**
 * Fetch the course catalog with optional filters and pagination parameters.
 */
export async function getCourses(
  params?: GetCoursesParams,
  signal?: AbortSignal
): Promise<PaginatedResponse<Course>> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params?.pageSize !== undefined) searchParams.set("pageSize", String(params.pageSize));
  if (params?.cursor) searchParams.set("cursor", params.cursor);

  const query = searchParams.toString();
  const response = await apiClient.get<PaginatedResponse<Course>>(
    `/courses${query ? `?${query}` : ""}`,
    undefined,
    signal
  );
  return response.data;
}

/**
 * Fetch a single course by ID with its modules.
 */
export async function getCourse(
  courseId: string,
  jwt?: string,
  signal?: AbortSignal
): Promise<Course> {
  const response = await apiClient.get<Course>(`/courses/${courseId}`, jwt, signal);
  return response.data;
}

/**
 * Enroll the authenticated user in a course.
 */
export async function enrollInCourse(
  courseId: string,
  jwt: string,
  signal?: AbortSignal
): Promise<CourseEnrollment> {
  const response = await apiClient.post<CourseEnrollment>(
    `/courses/${courseId}/enroll`,
    {},
    jwt,
    signal
  );
  return response.data;
}

/**
 * Fetch a single module within a course.
 */
export async function getModule(
  courseId: string,
  moduleId: string,
  jwt?: string,
  signal?: AbortSignal
): Promise<Module> {
  const response = await apiClient.get<Module>(
    `/courses/${courseId}/modules/${moduleId}`,
    jwt,
    signal
  );
  return response.data;
}

/**
 * Mark a module as completed.
 *
 * Returns a named `ModuleCompletionResult` (Issue #310, "all API responses
 * have types") instead of an inline `{ success: boolean }` so the shape is
 * importable from anywhere the response is handled.
 */
export async function markModuleComplete(
  courseId: string,
  moduleId: string,
  jwt: string,
  signal?: AbortSignal
): Promise<ModuleCompletionResult> {
  const response = await apiClient.post<ModuleCompletionResult>(
    `/courses/${courseId}/modules/${moduleId}/complete`,
    {},
    jwt,
    signal
  );
  return response.data;
}

/**
 * Fetch the user's enrolled courses.
 */
export async function getEnrollments(
  jwt: string,
  signal?: AbortSignal
): Promise<CourseEnrollment[]> {
  const response = await apiClient.get<CourseEnrollment[]>(
    "/courses/enrollments",
    jwt,
    signal
  );
  return response.data;
}

/**
 * Fetch recommended courses for the authenticated user.
 */
export async function getRecommendedCourses(
  jwt: string,
  signal?: AbortSignal
): Promise<RecommendedCourse[]> {
  const response = await apiClient.get<RecommendedCourse[]>(
    "/courses/recommended",
    jwt,
    signal
  );
  return response.data;
}

/**
 * Promote a `Module`'s raw `{ contentType, content }` pair into the
 * structured `ModuleContent` discriminated union so consumers can narrow
 * on `type` instead of switching on the stringly typed `contentType`.
 * Issue #310.
 *
 * The wire format is preserved: the API still sends `content` as an opaque
 * string. For `type: "video"` the string is treated as a URL, for
 * `type: "interactive"` as a challenge identifier, and for `type: "text"`
 * as the body itself. If the API adopts a structured payload later, only
 * this helper needs to change.
 */
export function parseModuleContent(module: Module): ModuleContent {
  switch (module.contentType) {
    case "video":
      return { type: "video", url: module.content };
    case "interactive":
      return { type: "interactive", challengeId: module.content };
    case "text":
    default:
      return { type: "text", body: module.content };
  }
}

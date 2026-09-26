import { apiClient } from "./client";
import { getValidToken } from "./auth";
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
  /** Page number for offset-based pagination (1-indexed) */
  page?: number;
  /** Number of items per page (alias for pageSize) */
  limit?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Cursor for cursor-based pagination (used for infinite scroll) */
  cursor?: string;
}

/**
 * Fetch the course catalog with optional filters and pagination parameters.
 * 
 * Supports two pagination strategies:
 * 1. **Offset-based**: Use `page` and `limit`/`pageSize` parameters
 * 2. **Cursor-based**: Use `cursor` parameter (for infinite scroll)
 * 
 * @example
 * // Offset-based pagination
 * const page1 = await getCourses({ page: 1, limit: 10 });
 * const page2 = await getCourses({ page: 2, limit: 10 });
 * 
 * @example
 * // Cursor-based pagination (infinite scroll)
 * const first = await getCourses({ limit: 10 });
 * const next = await getCourses({ cursor: first.nextCursor, limit: 10 });
 * 
 * @returns PaginatedResponse with:
 * - `data`: Array of courses
 * - `total`: Total number of courses matching filters
 * - `hasMore`: Boolean indicating if more data exists
 * - `nextCursor`: Cursor for next page (cursor-based pagination)
 * - `page`, `pageSize`: Current page info (offset-based pagination)
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
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.post<CourseEnrollment>(
    `/courses/${courseId}/enroll`,
    {},
    token,
    signal
  );
  return response.data;
}

/**
 * Fetch a single module's content within a course.
 * 
 * @param courseId - The course ID
 * @param moduleId - The module ID
 * @param jwt - Optional JWT token for authenticated requests
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Module with full content including lessons and material
 * 
 * @throws {ApiError} When the request fails or module is not found
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
 * Alias for getModule - fetches complete module content for the course viewer.
 * This provides a more explicit function name for clarity.
 */
export const getModuleContent = getModule;

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
): Promise<{ success: boolean }> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.post<{ success: boolean }>(
    `/courses/${courseId}/modules/${moduleId}/complete`,
    {},
    token,
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
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<CourseEnrollment[]>(
    "/courses/enrollments",
    token,
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
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<RecommendedCourse[]>(
    "/courses/recommended",
    token,
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
 * Fetch all modules for a course in order.
 * This is a convenience function that fetches the course and returns sorted modules.
 * 
 * @param courseId - The course ID
 * @param jwt - Optional JWT token for authenticated requests
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Array of modules sorted by order
 * 
 * @throws {ApiError} When the request fails or course is not found
 */
export async function getCourseModules(
  courseId: string,
  jwt?: string,
  signal?: AbortSignal
): Promise<Module[]> {
  const course = await getCourse(courseId, jwt, signal);
  return [...course.modules].sort((a, b) => a.order - b.order);
}

/**
 * Fetch multiple modules in a single batch.
 * Useful for preloading content or displaying multiple modules at once.
 * 
 * @param courseId - The course ID
 * @param moduleIds - Array of module IDs to fetch
 * @param jwt - Optional JWT token for authenticated requests
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Array of modules in the same order as moduleIds
 * 
 * @throws {ApiError} When any request fails
 */
export async function getModuleBatch(
  courseId: string,
  moduleIds: string[],
  jwt?: string,
  signal?: AbortSignal
): Promise<Module[]> {
  const modules = await Promise.all(
    moduleIds.map((moduleId) => getModule(courseId, moduleId, jwt, signal))
  );
  return modules;
}

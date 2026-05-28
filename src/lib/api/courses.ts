import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api";
import type { Course, CourseEnrollment, Module } from "@/types/course";

/**
 * Fetch the course catalog with optional filters.
 */
export async function getCourses(params?: {
  category?: string;
  difficulty?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Course>> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

  const query = searchParams.toString();
  const response = await apiClient.get<PaginatedResponse<Course>>(
    `/courses${query ? `?${query}` : ""}`
  );
  return response.data;
}

/**
 * Fetch a single course by ID with its modules.
 */
export async function getCourse(
  courseId: string,
  jwt?: string
): Promise<Course> {
  const response = await apiClient.get<Course>(`/courses/${courseId}`, jwt);
  return response.data;
}

/**
 * Enroll the authenticated user in a course.
 */
export async function enrollInCourse(
  courseId: string,
  jwt: string
): Promise<CourseEnrollment> {
  const response = await apiClient.post<CourseEnrollment>(
    `/courses/${courseId}/enroll`,
    {},
    jwt
  );
  return response.data;
}

/**
 * Fetch a single module within a course.
 */
export async function getModule(
  courseId: string,
  moduleId: string,
  jwt?: string
): Promise<Module> {
  const response = await apiClient.get<Module>(
    `/courses/${courseId}/modules/${moduleId}`,
    jwt
  );
  return response.data;
}

/**
 * Mark a module as completed.
 */
export async function markModuleComplete(
  courseId: string,
  moduleId: string,
  jwt: string
): Promise<{ success: boolean }> {
  const response = await apiClient.post<{ success: boolean }>(
    `/courses/${courseId}/modules/${moduleId}/complete`,
    {},
    jwt
  );
  return response.data;
}

/**
 * Fetch the user's enrolled courses.
 */
export async function getEnrollments(
  jwt: string
): Promise<CourseEnrollment[]> {
  const response = await apiClient.get<CourseEnrollment[]>(
    "/courses/enrollments",
    jwt
  );
  return response.data;
}

/**
 * Fetch recommended courses for the authenticated user.
 */
export async function getRecommendedCourses(
  jwt: string
): Promise<Course[]> {
  const response = await apiClient.get<Course[]>(
    "/courses/recommended",
    jwt
  );
  return response.data;
}

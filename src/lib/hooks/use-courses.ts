"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCourseStore } from "@/store/course-store";
import {
  getCourses,
  getCourse,
  enrollInCourse,
  getModule,
  markModuleComplete,
  getEnrollments,
  getRecommendedCourses,
} from "@/lib/api/courses";
import { isAbortError } from "@/lib/api/client";
import type { Course, CourseEnrollment, Module, RecommendedCourse } from "@/types/course";

const CACHE_TTL_MS = 60_000;

type CoursesCacheEntry = {
  data: Course[];
  fetchedAt: number;
};

type EnrollmentsCacheEntry = {
  data: CourseEnrollment[];
  fetchedAt: number;
};

const coursesCache = new Map<string, CoursesCacheEntry>();
const coursesInFlight = new Map<string, Promise<Course[]>>();

const enrollmentsCache = new Map<string, EnrollmentsCacheEntry>();
const enrollmentsInFlight = new Map<string, Promise<CourseEnrollment[]>>();

function coursesCacheKey(params?: {
  category?: string;
  difficulty?: string;
}): string {
  return JSON.stringify({
    category: params?.category ?? "",
    difficulty: params?.difficulty ?? "",
  });
}

function getCachedCourses(key: string): Course[] | null {
  const cached = coursesCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) {
    coursesCache.delete(key);
    return null;
  }
  return cached.data;
}

function getCachedEnrollments(jwt: string): CourseEnrollment[] | null {
  const cached = enrollmentsCache.get(jwt);
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) {
    enrollmentsCache.delete(jwt);
    return null;
  }
  return cached.data;
}

async function loadCourses(
  params?: {
    category?: string;
    difficulty?: string;
  },
  signal?: AbortSignal
): Promise<Course[]> {
  const key = coursesCacheKey(params);
  const cached = getCachedCourses(key);
  if (cached) return cached;

  const existing = coursesInFlight.get(key);
  if (existing) return existing;

  const request = getCourses(params, signal)
    .then((result) => {
      coursesCache.set(key, { data: result.data, fetchedAt: Date.now() });
      return result.data;
    })
    .finally(() => {
      coursesInFlight.delete(key);
    });

  coursesInFlight.set(key, request);
  return request;
}

async function loadEnrollments(
  jwt: string,
  signal?: AbortSignal
): Promise<CourseEnrollment[]> {
  const cached = getCachedEnrollments(jwt);
  if (cached) return cached;

  const existing = enrollmentsInFlight.get(jwt);
  if (existing) return existing;

  const request = getEnrollments(jwt, signal)
    .then((data) => {
      enrollmentsCache.set(jwt, { data, fetchedAt: Date.now() });
      return data;
    })
    .finally(() => {
      enrollmentsInFlight.delete(jwt);
    });

  enrollmentsInFlight.set(jwt, request);
  return request;
}

function invalidateEnrollmentsCache(jwt?: string | null) {
  if (jwt) {
    enrollmentsCache.delete(jwt);
    return;
  }
  enrollmentsCache.clear();
}

export function useCourses() {
  const jwt = useAuthStore((s) => s.jwt);
  const { enrollments, setEnrollments, enroll: addEnrollment } = useCourseStore();
  const [courses, setCourses] = useState<Course[]>(() => {
    return getCachedCourses(coursesCacheKey()) ?? [];
  });
  const [loading, setLoading] = useState(() => {
    return getCachedCourses(coursesCacheKey()) === null;
  });
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCourses = useCallback(
    async (params?: { category?: string; difficulty?: string }) => {
      const key = coursesCacheKey(params);
      const cached = getCachedCourses(key);
      if (cached) {
        setCourses(cached);
        setLoading(false);
        setError(null);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const data = await loadCourses(params, controller.signal);
        setCourses(data);
      } catch (err) {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchEnrollments = useCallback(async () => {
    if (!jwt) return;

    const cached = getCachedEnrollments(jwt);
    if (cached) {
      setEnrollments(cached);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await loadEnrollments(jwt, controller.signal);
      setEnrollments(data);
    } catch (err) {
      if (isAbortError(err)) return;
      console.error("Failed to fetch enrollments:", err);
    }
  }, [jwt, setEnrollments]);

  const enroll = useCallback(
    async (courseId: string) => {
      if (!jwt) throw new Error("Not authenticated");
      const enrollment = await enrollInCourse(courseId, jwt);
      addEnrollment(enrollment);
      // Drop cached enrollments so the next mount/refetch sees server state
      invalidateEnrollmentsCache(jwt);
      return enrollment;
    },
    [jwt, addEnrollment]
  );

  useEffect(() => {
    fetchCourses();
    return () => abortRef.current?.abort();
  }, [fetchCourses]);

  useEffect(() => {
    fetchEnrollments();
    return () => abortRef.current?.abort();
  }, [fetchEnrollments]);

  return {
    courses,
    enrollments,
    loading,
    error,
    fetchCourses,
    enroll,
    fetchEnrollments,
  };
}

const INFINITE_PAGE_SIZE = 9;

function dedupeCourses(list: Course[]): Course[] {
  const seen = new Set<string>();
  const result: Course[] = [];
  for (const course of list) {
    if (seen.has(course.id)) continue;
    seen.add(course.id);
    result.push(course);
  }
  return result;
}

/**
 * Loads the course catalog page-by-page as the user scrolls, instead of
 * fetching the entire catalog up front. Search is applied client-side over
 * the already-loaded pages.
 */
export function useInfiniteCourses(filters: {
  category?: string;
  difficulty?: string;
}) {
  const category = filters.category ?? "All";
  const difficulty = filters.difficulty ?? "All";

  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (nextPage: number, replace: boolean) => {
      const id = ++requestId.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const result = await getCourses(
          {
            category: category === "All" ? undefined : category,
            difficulty: difficulty === "All" ? undefined : difficulty,
            page: nextPage,
            pageSize: INFINITE_PAGE_SIZE,
          },
          controller.signal
        );
        if (id !== requestId.current) return;
        setCourses((prev) =>
          replace ? result.data : dedupeCourses([...prev, ...result.data])
        );
        setHasMore(result.hasMore);
        setPage(nextPage);
      } catch (err) {
        if (id !== requestId.current || isAbortError(err)) return;
        setError(
          err instanceof Error ? err.message : "Failed to fetch courses"
        );
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [category, difficulty]
  );

  // Reset and refetch from the first page whenever filters change.
  useEffect(() => {
    load(1, true);
    return () => abortRef.current?.abort();
  }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    load(page + 1, false);
  }, [hasMore, loadingMore, loading, page, load]);

  return { courses, hasMore, loading, loadingMore, error, loadMore };
}

export function useCourseDetail(courseId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const jwtRef = useRef(jwt);
  jwtRef.current = jwt;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    const controller = new AbortController();
    setLoading(true);
    getCourse(courseId, jwtRef.current ?? undefined, controller.signal)
      .then(setCourse)
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Failed to load course");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [courseId]);

  return { course, loading, error };
}

export function useModule(courseId: string, moduleId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const jwtRef = useRef(jwt);
  jwtRef.current = jwt;
  const updateProgress = useCourseStore((s) => s.updateProgress);
  const setEnrollments = useCourseStore((s) => s.setEnrollments);
  const currentCourse = useCourseStore((s) => s.currentCourse);
  const setCurrentCourse = useCourseStore((s) => s.setCurrentCourse);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !moduleId) return;
    const controller = new AbortController();
    setLoading(true);
    getModule(courseId, moduleId, jwtRef.current ?? undefined, controller.signal)
      .then(setModule)
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Failed to load module");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [courseId, moduleId]);

  const complete = useCallback(async () => {
    const token = jwtRef.current;
    if (!token) throw new Error("Not authenticated");
    await markModuleComplete(courseId, moduleId, token);
    if (!currentCourse || currentCourse.id !== courseId) {
      const course = await getCourse(courseId, token);
      setCurrentCourse(course);
    }
    updateProgress(courseId, moduleId);
    // Sync enrollments with server data so progress sources don't diverge
    invalidateEnrollmentsCache(token);
    loadEnrollments(token).then(setEnrollments).catch(console.error);
  }, [courseId, moduleId, updateProgress, setEnrollments, currentCourse, setCurrentCourse]);

  return { module, loading, error, complete };
}

export function useRecommendedCourses() {
  const jwt = useAuthStore((s) => s.jwt);
  const [recommended, setRecommended] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jwt) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setError(null);
    getRecommendedCourses(jwt, controller.signal)
      .then(setRecommended)
      .catch((err) => {
        if (isAbortError(err)) return;
        const message = err instanceof Error ? err.message : "Failed to load recommendations";
        setError(message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [jwt]);

  return { recommended, loading, error };
}

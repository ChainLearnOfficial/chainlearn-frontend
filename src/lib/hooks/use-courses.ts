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

async function loadCourses(params?: {
  category?: string;
  difficulty?: string;
}): Promise<Course[]> {
  const key = coursesCacheKey(params);
  const cached = getCachedCourses(key);
  if (cached) return cached;

  const existing = coursesInFlight.get(key);
  if (existing) return existing;

  const request = getCourses(params)
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

async function loadEnrollments(jwt: string): Promise<CourseEnrollment[]> {
  const cached = getCachedEnrollments(jwt);
  if (cached) return cached;

  const existing = enrollmentsInFlight.get(jwt);
  if (existing) return existing;

  const request = getEnrollments(jwt)
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

      setLoading(true);
      setError(null);
      try {
        const data = await loadCourses(params);
        setCourses(data);
      } catch (err) {
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

    try {
      const data = await loadEnrollments(jwt);
      setEnrollments(data);
    } catch (err) {
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
  }, [fetchCourses]);

  useEffect(() => {
    fetchEnrollments();
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

export function useCourseDetail(courseId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const jwtRef = useRef(jwt);
  jwtRef.current = jwt;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getCourse(courseId, jwtRef.current ?? undefined)
      .then(setCourse)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load course")
      )
      .finally(() => setLoading(false));
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
    setLoading(true);
    getModule(courseId, moduleId, jwtRef.current ?? undefined)
      .then(setModule)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load module")
      )
      .finally(() => setLoading(false));
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
    setError(null);
    getRecommendedCourses(jwt)
      .then(setRecommended)
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load recommendations";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [jwt]);

  return { recommended, loading, error };
}

"use client";

import { useCallback, useEffect, useState } from "react";
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
import type { Course, CourseEnrollment, Module } from "@/types/course";

export function useCourses() {
  const jwt = useAuthStore((s) => s.jwt);
  const { enrollments, setEnrollments } = useCourseStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(
    async (params?: { category?: string; difficulty?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getCourses(params);
        setCourses(result.data);
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
    try {
      const data = await getEnrollments(jwt);
      setEnrollments(data);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    }
  }, [jwt, setEnrollments]);

  const enroll = useCallback(
    async (courseId: string) => {
      if (!jwt) throw new Error("Not authenticated");
      const enrollment = await enrollInCourse(courseId, jwt);
      setEnrollments([...enrollments, enrollment]);
      return enrollment;
    },
    [jwt, enrollments, setEnrollments]
  );

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, [fetchCourses, fetchEnrollments]);

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
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getCourse(courseId, jwt ?? undefined)
      .then(setCourse)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load course")
      )
      .finally(() => setLoading(false));
  }, [courseId, jwt]);

  return { course, loading, error };
}

export function useModule(courseId: string, moduleId: string) {
  const jwt = useAuthStore((s) => s.jwt);
  const updateProgress = useCourseStore((s) => s.updateProgress);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !moduleId) return;
    setLoading(true);
    getModule(courseId, moduleId, jwt ?? undefined)
      .then(setModule)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load module")
      )
      .finally(() => setLoading(false));
  }, [courseId, moduleId, jwt]);

  const complete = useCallback(async () => {
    if (!jwt) throw new Error("Not authenticated");
    await markModuleComplete(courseId, moduleId, jwt);
    updateProgress(courseId, moduleId);
  }, [courseId, moduleId, jwt, updateProgress]);

  return { module, loading, error, complete };
}

export function useRecommendedCourses() {
  const jwt = useAuthStore((s) => s.jwt);
  const [recommended, setRecommended] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jwt) {
      setLoading(false);
      return;
    }
    getRecommendedCourses(jwt)
      .then(setRecommended)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jwt]);

  return { recommended, loading };
}

import { create } from "zustand";
import type { Course, CourseEnrollment, CourseProgress } from "@/types/course";

interface CourseState {
  currentCourse: Course | null;
  enrollments: CourseEnrollment[];
  progress: Record<string, CourseProgress>;
  setCurrentCourse: (course: Course | null) => void;
  setEnrollments: (enrollments: CourseEnrollment[]) => void;
  enroll: (enrollment: CourseEnrollment) => void;
  updateProgress: (courseId: string, moduleId: string) => void;
  getProgress: (courseId: string) => CourseProgress | null;
}

export const useCourseStore = create<CourseState>()((set, get) => ({
  currentCourse: null,
  enrollments: [],
  progress: {},

  setCurrentCourse: (course) => set({ currentCourse: course }),

  setEnrollments: (enrollments) => set({ enrollments }),

  enroll: (enrollment) =>
    set((state) => ({
      enrollments: [...state.enrollments, enrollment],
    })),

  updateProgress: (courseId, moduleId) =>
    set((state) => {
      const existing = state.progress[courseId];
      const completedModules = existing
        ? [...new Set([...(existing.completedModules || []), moduleId])]
        : [moduleId];
      const course = state.currentCourse;
      const totalModules = course?.totalModules ?? existing?.totalModules ?? 0;
      const progressPercent =
        totalModules > 0
          ? Math.round((completedModules.length / totalModules) * 100)
          : 0;

      return {
        progress: {
          ...state.progress,
          [courseId]: {
            courseId,
            totalModules,
            completedModules: completedModules.length,
            progressPercent,
            currentModuleId: moduleId,
          },
        },
      };
    }),

  getProgress: (courseId) => get().progress[courseId] ?? null,
}));

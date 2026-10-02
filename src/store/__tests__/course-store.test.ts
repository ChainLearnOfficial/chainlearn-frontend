import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useCourseStore } from "../course-store";
import type { Course, CourseEnrollment } from "@/types/course";

const createMockCourse = (overrides?: Partial<Course>): Course => ({
  id: "course-1",
  title: "Test Course",
  description: "Test Description",
  difficulty: "beginner",
  category: "stellar",
  totalModules: 5,
  modules: [],
  estimatedHours: 10,
  enrolledCount: 100,
  rewardTokenAmount: 50,
  createdAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const createMockEnrollment = (
  overrides?: Partial<CourseEnrollment>,
): CourseEnrollment => ({
  id: "enrollment-1",
  courseId: "course-1",
  userId: "user-1",
  enrolledAt: "2024-01-01T00:00:00Z",
  progress: 0,
  completedModules: [],
  lastAccessedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("useCourseStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useCourseStore.setState({
      currentCourse: null,
      enrollments: [],
      progress: {},
    });
  });

  afterEach(() => {
    // Clean up after each test
    useCourseStore.setState({
      currentCourse: null,
      enrollments: [],
      progress: {},
    });
  });

  describe("setCurrentCourse", () => {
    it("should set the current course", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse();

      store.setCurrentCourse(mockCourse);

      expect(store.currentCourse).toEqual(mockCourse);
    });

    it("should set current course to null", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse();
      store.setCurrentCourse(mockCourse);

      store.setCurrentCourse(null);

      expect(store.currentCourse).toBe(null);
    });
  });

  describe("setEnrollments", () => {
    it("should set enrollments", () => {
      const store = useCourseStore.getState();
      const mockEnrollments: CourseEnrollment[] = [
        createMockEnrollment({ id: "enrollment-1", courseId: "course-1" }),
        createMockEnrollment({
          id: "enrollment-2",
          courseId: "course-2",
          progress: 50,
          completedModules: ["module-1"],
        }),
      ];

      store.setEnrollments(mockEnrollments);

      expect(store.enrollments).toEqual(mockEnrollments);
    });

    it("should replace existing enrollments", () => {
      const store = useCourseStore.getState();
      const initialEnrollments: CourseEnrollment[] = [
        createMockEnrollment({ id: "enrollment-1", courseId: "course-1" }),
      ];
      store.setEnrollments(initialEnrollments);

      const newEnrollments: CourseEnrollment[] = [
        createMockEnrollment({
          id: "enrollment-2",
          courseId: "course-2",
          progress: 50,
          completedModules: ["module-1"],
        }),
      ];
      store.setEnrollments(newEnrollments);

      expect(store.enrollments).toEqual(newEnrollments);
      expect(store.enrollments.length).toBe(1);
    });
  });

  describe("enroll", () => {
    it("should add enrollment when it doesn't exist", () => {
      const store = useCourseStore.getState();
      const mockEnrollment = createMockEnrollment();

      store.enroll(mockEnrollment);

      expect(store.enrollments).toContain(mockEnrollment);
      expect(store.enrollments.length).toBe(1);
    });

    it("should not add duplicate enrollment by courseId", () => {
      const store = useCourseStore.getState();
      const enrollment1 = createMockEnrollment({
        id: "enrollment-1",
        courseId: "course-1",
      });
      const enrollment2 = createMockEnrollment({
        id: "enrollment-2",
        courseId: "course-1",
      });

      store.enroll(enrollment1);
      store.enroll(enrollment2);

      expect(store.enrollments.length).toBe(1);
      expect(store.enrollments[0]).toEqual(enrollment1);
    });

    it("should not add duplicate enrollment by id", () => {
      const store = useCourseStore.getState();
      const enrollment1 = createMockEnrollment({
        id: "enrollment-1",
        courseId: "course-1",
      });
      const enrollment2 = createMockEnrollment({
        id: "enrollment-1",
        courseId: "course-2",
      });

      store.enroll(enrollment1);
      store.enroll(enrollment2);

      expect(store.enrollments.length).toBe(1);
      expect(store.enrollments[0]).toEqual(enrollment1);
    });

    it("should add multiple different enrollments", () => {
      const store = useCourseStore.getState();
      const enrollment1 = createMockEnrollment({
        id: "enrollment-1",
        courseId: "course-1",
      });
      const enrollment2 = createMockEnrollment({
        id: "enrollment-2",
        courseId: "course-2",
      });

      store.enroll(enrollment1);
      store.enroll(enrollment2);

      expect(store.enrollments.length).toBe(2);
      expect(store.enrollments).toContain(enrollment1);
      expect(store.enrollments).toContain(enrollment2);
    });
  });

  describe("updateProgress", () => {
    it("should create progress entry for new course", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse();
      store.setCurrentCourse(mockCourse);

      store.updateProgress("course-1", "module-1");

      expect(store.progress["course-1"]).toBeDefined();
      expect(store.progress["course-1"].courseId).toBe("course-1");
      expect(store.progress["course-1"].completedModuleIds).toContain(
        "module-1",
      );
    });

    it("should add module to completed modules", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse();
      store.setCurrentCourse(mockCourse);
      store.updateProgress("course-1", "module-1");

      store.updateProgress("course-1", "module-2");

      expect(store.progress["course-1"].completedModuleIds).toContain(
        "module-1",
      );
      expect(store.progress["course-1"].completedModuleIds).toContain(
        "module-2",
      );
    });

    it("should not add duplicate module to completed modules", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse();
      store.setCurrentCourse(mockCourse);

      store.updateProgress("course-1", "module-1");
      store.updateProgress("course-1", "module-1");

      expect(
        store.progress["course-1"].completedModuleIds.filter(
          (id: string) => id === "module-1",
        ).length,
      ).toBe(1);
    });

    it("should calculate progress percent correctly", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse({ totalModules: 4 });
      store.setCurrentCourse(mockCourse);

      store.updateProgress("course-1", "module-1");
      store.updateProgress("course-1", "module-2");

      expect(store.progress["course-1"].progressPercent).toBe(50);
    });

    it("should round progress percent", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse({ totalModules: 3 });
      store.setCurrentCourse(mockCourse);

      store.updateProgress("course-1", "module-1");
      store.updateProgress("course-1", "module-2");

      expect(store.progress["course-1"].progressPercent).toBe(67);
    });

    it("should handle zero total modules", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse({ totalModules: 0 });
      store.setCurrentCourse(mockCourse);

      store.updateProgress("course-1", "module-1");

      expect(store.progress["course-1"].progressPercent).toBe(0);
    });

    it("should use existing totalModules from progress", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse();
      store.setCurrentCourse(mockCourse);
      store.updateProgress("course-1", "module-1");

      // Change currentCourse to null
      store.setCurrentCourse(null);

      store.updateProgress("course-1", "module-2");

      expect(store.progress["course-1"].totalModules).toBe(5);
    });

    it("should set currentModuleId", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse();
      store.setCurrentCourse(mockCourse);

      store.updateProgress("course-1", "module-3");

      expect(store.progress["course-1"].currentModuleId).toBe("module-3");
    });
  });

  describe("getProgress", () => {
    it("should return progress for existing course", () => {
      const store = useCourseStore.getState();
      const mockCourse = createMockCourse();
      store.setCurrentCourse(mockCourse);
      store.updateProgress("course-1", "module-1");

      const progress = store.getProgress("course-1");

      expect(progress).toBeDefined();
      expect(progress?.courseId).toBe("course-1");
    });

    it("should return null for non-existent course", () => {
      const store = useCourseStore.getState();

      const progress = store.getProgress("non-existent-course");

      expect(progress).toBe(null);
    });
  });

  describe("persistence", () => {
    it("should persist course state across store instances", () => {
      const store1 = useCourseStore.getState();
      const mockCourse = createMockCourse();
      store1.setCurrentCourse(mockCourse);

      const store2 = useCourseStore.getState();

      expect(store2.currentCourse).toEqual(mockCourse);
    });

    it("should persist enrollments across store instances", () => {
      const store1 = useCourseStore.getState();
      const mockEnrollment = createMockEnrollment();
      store1.enroll(mockEnrollment);

      const store2 = useCourseStore.getState();

      expect(store2.enrollments).toContain(mockEnrollment);
    });

    it("should persist progress across store instances", () => {
      const store1 = useCourseStore.getState();
      const mockCourse = createMockCourse();
      store1.setCurrentCourse(mockCourse);
      store1.updateProgress("course-1", "module-1");

      const store2 = useCourseStore.getState();

      expect(store2.progress["course-1"]).toBeDefined();
      expect(store2.progress["course-1"].completedModuleIds).toContain(
        "module-1",
      );
    });
  });
});

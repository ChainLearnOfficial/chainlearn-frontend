import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseCard } from "@/components/course/course-card";
import type { Course } from "@/types/course";

const baseCourse: Course = {
  id: "course-1",
  title: "Intro to Stellar",
  description: "Learn the Stellar blockchain from scratch.",
  difficulty: "beginner",
  category: "Blockchain",
  estimatedHours: 2,
  modules: [],
  totalModules: 4,
  enrolledCount: 120,
  rewardTokenAmount: 50,
  createdAt: "2024-01-01T00:00:00Z",
};

describe("CourseCard", () => {
  it("renders the course title", () => {
    render(<CourseCard course={baseCourse} />);
    expect(screen.getByText("Intro to Stellar")).toBeInTheDocument();
  });

  it("renders the course description", () => {
    render(<CourseCard course={baseCourse} />);
    expect(screen.getByText("Learn the Stellar blockchain from scratch.")).toBeInTheDocument();
  });

  it("renders the difficulty badge", () => {
    render(<CourseCard course={baseCourse} />);
    expect(screen.getByText("beginner")).toBeInTheDocument();
  });

  it("renders the category", () => {
    render(<CourseCard course={baseCourse} />);
    expect(screen.getByText("Blockchain")).toBeInTheDocument();
  });

  it("renders reward token amount", () => {
    render(<CourseCard course={baseCourse} />);
    expect(screen.getByText("+50 LEARN")).toBeInTheDocument();
  });

  it("renders enrolled count", () => {
    render(<CourseCard course={baseCourse} />);
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("links to the correct course URL", () => {
    render(<CourseCard course={baseCourse} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/courses/course-1");
  });

  it("shows progress bar when enrolled with progress", () => {
    render(<CourseCard course={baseCourse} enrolled progress={60} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
  });

  it("does not show progress bar when not enrolled", () => {
    render(<CourseCard course={baseCourse} />);
    expect(screen.queryByText("Progress")).not.toBeInTheDocument();
  });

  it.each([
    ["beginner", "bg-green-100"],
    ["intermediate", "bg-yellow-100"],
    ["advanced", "bg-red-100"],
  ] as const)("difficulty=%s has correct badge color", (difficulty, cls) => {
    render(<CourseCard course={{ ...baseCourse, difficulty }} />);
    const badge = screen.getByText(difficulty);
    expect(badge.className).toContain(cls);
  });
});

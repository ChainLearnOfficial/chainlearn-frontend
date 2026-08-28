import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseCard } from "@/components/course/course-card";
import type { Course } from "@/types/course";

const mockCourse: Course = {
  id: "c1",
  title: "Stellar Basics",
  description: "Learn the Stellar network fundamentals.",
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
  it("renders course title and difficulty", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText("Stellar Basics")).toBeInTheDocument();
    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
    expect(screen.getByText("Blockchain")).toBeInTheDocument();
    expect(screen.getByText("+50 LEARN")).toBeInTheDocument();
  });

  it("links to the course detail page", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/courses/c1");
  });

  it("shows progress when enrolled", () => {
    render(<CourseCard course={mockCourse} enrolled progress={40} />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });
});

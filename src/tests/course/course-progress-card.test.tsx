import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseProgressCard } from "@/components/course/course-progress-card";

describe("CourseProgressCard", () => {
  const baseProps = {
    courseId: "course-1",
    courseTitle: "Stellar Development",
  };

  it("renders the course title and in-progress status", () => {
    render(<CourseProgressCard {...baseProps} progress={40} />);
    expect(screen.getByText("Stellar Development")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /continue learning/i })
    ).toHaveAttribute("href", "/courses/course-1");
  });

  it("shows completed status with a review action at 100%", () => {
    render(<CourseProgressCard {...baseProps} progress={100} />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /review course/i })
    ).toBeInTheDocument();
  });

  it("renders the module count", () => {
    render(<CourseProgressCard {...baseProps} progress={30} moduleCount={8} />);
    expect(screen.getByText("8 modules")).toBeInTheDocument();
  });

  it("renders completed module count when provided", () => {
    render(
      <CourseProgressCard
        {...baseProps}
        progress={50}
        completedModules={4}
        moduleCount={8}
      />
    );
    expect(screen.getByText("4 of 8 modules")).toBeInTheDocument();
  });

  it("uses a custom continue href", () => {
    render(
      <CourseProgressCard
        {...baseProps}
        progress={10}
        continueHref="/courses/course-1/modules/mod-2"
      />
    );
    expect(
      screen.getByRole("link", { name: /continue learning/i })
    ).toHaveAttribute("href", "/courses/course-1/modules/mod-2");
  });

  it("merges custom className", () => {
    const { container } = render(
      <CourseProgressCard {...baseProps} progress={10} className="my-class" />
    );
    expect((container.firstChild as HTMLElement).className).toContain("my-class");
  });
});
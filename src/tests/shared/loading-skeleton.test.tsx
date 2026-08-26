import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  LoadingSkeleton,
  CourseCardSkeleton,
  DashboardSkeleton,
} from "@/components/shared/loading-skeleton";

describe("LoadingSkeleton", () => {
  it("renders one skeleton by default", () => {
    const { container } = render(<LoadingSkeleton />);
    // default count=1 → one pulse div inside the space-y-3 wrapper
    const pulses = container.querySelectorAll(".animate-pulse");
    expect(pulses).toHaveLength(1);
  });

  it("renders the requested count of items", () => {
    const { container } = render(<LoadingSkeleton count={4} />);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
  });

  it.each([
    ["card", "h-48"],
    ["text", "h-4"],
    ["circle", "rounded-full"],
  ] as const)("variant=%s applies correct shape class", (variant, cls) => {
    const { container } = render(<LoadingSkeleton variant={variant} />);
    expect((container.querySelector(".animate-pulse") as HTMLElement).className).toContain(cls);
  });
});

describe("CourseCardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<CourseCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("contains animated pulse elements", () => {
    const { container } = render(<CourseCardSkeleton />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

describe("DashboardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders stat card placeholders", () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  LoadingSkeleton,
  CourseCardSkeleton,
  CourseGridSkeleton,
  TableSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  DashboardSkeleton,
} from "@/components/shared/loading-skeleton";

const skeletons = (el: HTMLElement) =>
  el.querySelectorAll('[data-slot="skeleton"]');

describe("LoadingSkeleton", () => {
  it("renders one skeleton by default", () => {
    const { container } = render(<LoadingSkeleton />);
    expect(skeletons(container)).toHaveLength(1);
  });

  it("renders the requested count of items", () => {
    const { container } = render(<LoadingSkeleton count={4} />);
    expect(skeletons(container)).toHaveLength(4);
  });

  it("exposes a polite status role for screen readers", () => {
    const { getByRole } = render(<LoadingSkeleton />);
    expect(getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it.each([
    ["card", "h-48"],
    ["text", "h-4"],
    ["circle", "rounded-full"],
  ] as const)("variant=%s applies correct shape class", (variant, cls) => {
    const { container } = render(<LoadingSkeleton variant={variant} />);
    expect((skeletons(container)[0] as HTMLElement).className).toContain(cls);
  });
});

describe("CourseCardSkeleton", () => {
  it("renders animated placeholder elements", () => {
    const { container } = render(<CourseCardSkeleton />);
    expect(skeletons(container).length).toBeGreaterThan(0);
  });
});

describe("CourseGridSkeleton", () => {
  it("renders the requested number of cards", () => {
    const { container } = render(<CourseGridSkeleton count={3} />);
    // each card contains multiple skeleton blocks
    expect(container.querySelectorAll(".grid > div")).toHaveLength(3);
  });
});

describe("TableSkeleton", () => {
  it("renders a header plus the requested rows", () => {
    const { container } = render(<TableSkeleton rows={3} columns={4} />);
    // 4 header cells + 3 rows * 4 cells = 16
    expect(skeletons(container)).toHaveLength(16);
  });
});

describe("FormSkeleton", () => {
  it("renders a label/input pair per field plus a submit button", () => {
    const { container } = render(<FormSkeleton fields={3} />);
    // 3 * (label + input) + submit button = 7
    expect(skeletons(container)).toHaveLength(7);
  });
});

describe("ProfileSkeleton", () => {
  it("renders an avatar and detail placeholders", () => {
    const { container } = render(<ProfileSkeleton />);
    expect(skeletons(container).length).toBeGreaterThan(4);
  });
});

describe("DashboardSkeleton", () => {
  it("renders stat card and course placeholders", () => {
    const { container } = render(<DashboardSkeleton />);
    expect(skeletons(container).length).toBeGreaterThan(0);
  });
});

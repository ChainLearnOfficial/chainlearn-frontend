import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonStack,
} from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("renders with a shimmer animation by default", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.firstChild).toHaveClass("animate-shimmer");
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).toHaveAttribute("data-slot", "skeleton");
  });

  it("supports opting into the pulse animation", () => {
    const { container } = render(<Skeleton animation="pulse" />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("supports text, circle, and rectangle variants", () => {
    const { rerender, container } = render(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass("rounded");

    rerender(<Skeleton variant="circle" className="h-10 w-10" />);
    expect(container.firstChild).toHaveClass("rounded-full");

    rerender(<Skeleton variant="rectangle" />);
    expect(container.firstChild).toHaveClass("rounded-md");
  });

  it("composes helpers into a layout", () => {
    const { container } = render(
      <div>
        <SkeletonCircle />
        <SkeletonText className="w-1/2" />
        <SkeletonStack lines={2} />
      </div>
    );
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThanOrEqual(4);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/course/progress-bar";

describe("ProgressBar", () => {
  it("renders progress value and label", () => {
    render(<ProgressBar value={65} />);
    expect(screen.getByText("65%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "65");
  });

  it("clamps values outside 0-100", () => {
    render(<ProgressBar value={150} showLabel />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("hides label when showLabel is false", () => {
    render(<ProgressBar value={30} showLabel={false} />);
    expect(screen.queryByText("Progress")).not.toBeInTheDocument();
  });

  it("applies size classes", () => {
    const { container } = render(<ProgressBar value={10} size="lg" showLabel={false} />);
    expect(container.querySelector('[role="progressbar"]')).toHaveClass("h-3");
  });
});

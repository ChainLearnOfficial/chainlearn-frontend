import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/course/progress-bar";

describe("ProgressBar", () => {
  it("renders with a progress role", () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets aria-valuenow to the clamped value", () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
  });

  it("clamps values above 100 to 100", () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps values below 0 to 0", () => {
    render(<ProgressBar value={-10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("shows label when showLabel is true (default)", () => {
    render(<ProgressBar value={42} />);
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
  });

  it("hides label when showLabel is false", () => {
    render(<ProgressBar value={42} showLabel={false} />);
    expect(screen.queryByText("42%")).not.toBeInTheDocument();
  });

  it.each([
    ["sm", "h-1"],
    ["md", "h-2"],
    ["lg", "h-3"],
  ] as const)("size=%s applies height class", (size, cls) => {
    render(<ProgressBar value={50} size={size} />);
    expect(screen.getByRole("progressbar").className).toContain(cls);
  });

  it("sets aria-valuemin=0 and aria-valuemax=100", () => {
    render(<ProgressBar value={50} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
});

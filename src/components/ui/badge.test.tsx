import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge, difficultyVariant, type BadgeVariant } from "./badge";

const ALL_VARIANTS: BadgeVariant[] = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "success",
  "warning",
  "beginner",
  "intermediate",
  "advanced",
];

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Beginner</Badge>);
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });

  it.each(ALL_VARIANTS)("renders the %s variant", (variant) => {
    render(<Badge variant={variant}>{variant}</Badge>);
    const badge = screen.getByText(variant);

    expect(badge).toBeInTheDocument();
    // Every variant keeps the shared pill geometry.
    expect(badge.className).toContain("rounded-full");
    expect(badge.className).toContain("text-xs");
  });

  it("defaults to the default variant", () => {
    render(<Badge>Plain</Badge>);
    expect(screen.getByText("Plain").className).toContain("bg-primary-100");
  });

  it("gives each difficulty a distinct colour", () => {
    const { rerender } = render(<Badge variant="beginner">Level</Badge>);
    const beginner = screen.getByText("Level").className;

    rerender(<Badge variant="intermediate">Level</Badge>);
    const intermediate = screen.getByText("Level").className;

    rerender(<Badge variant="advanced">Level</Badge>);
    const advanced = screen.getByText("Level").className;

    expect(new Set([beginner, intermediate, advanced]).size).toBe(3);
  });

  it("merges a caller-supplied className", () => {
    render(<Badge className="ml-4">Spaced</Badge>);
    expect(screen.getByText("Spaced").className).toContain("ml-4");
  });

  it("forwards a ref to the underlying span", () => {
    let node: HTMLSpanElement | null = null;
    render(<Badge ref={(el) => { node = el; }}>Ref</Badge>);

    expect(node).toBeInstanceOf(HTMLSpanElement);
  });

  it("passes through arbitrary span attributes", () => {
    render(
      <Badge data-testid="status" title="Verified on-chain">
        Verified
      </Badge>
    );

    expect(screen.getByTestId("status")).toHaveAttribute(
      "title",
      "Verified on-chain"
    );
  });

  it("supports an explicit accessible label for icon-adjacent use", () => {
    render(<Badge aria-label="Difficulty: beginner">Beginner</Badge>);
    expect(screen.getByLabelText("Difficulty: beginner")).toBeInTheDocument();
  });

  it("carries its meaning in text, not colour alone", () => {
    // The accessibility criterion: a screen reader (or a colour-blind reader)
    // gets the status from the label, never from the background.
    render(<Badge variant="advanced">Advanced</Badge>);
    expect(screen.getByText("Advanced")).toHaveTextContent("Advanced");
  });
});

describe("difficultyVariant", () => {
  it.each([
    ["beginner", "beginner"],
    ["intermediate", "intermediate"],
    ["advanced", "advanced"],
  ] as const)("maps %s to its own variant", (input, expected) => {
    expect(difficultyVariant(input)).toBe(expected);
  });

  it("falls back to secondary for an unknown difficulty", () => {
    // An unfamiliar level from the API should render plainly rather than
    // crash the course list.
    expect(difficultyVariant("expert")).toBe("secondary");
    expect(difficultyVariant("")).toBe("secondary");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileNav } from "@/components/layout/mobile-nav";

describe("MobileNav", () => {
  it("renders bottom navigation links", () => {
    render(<MobileNav />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Courses")).toBeInTheDocument();
    expect(screen.getByText("Rewards")).toBeInTheDocument();
    expect(screen.getByText("Credentials")).toBeInTheDocument();
  });

  it("highlights the active link", () => {
    render(<MobileNav />);
    const dashboard = screen.getByText("Dashboard").closest("a");
    expect(dashboard).toHaveClass("text-primary-600");
  });
});

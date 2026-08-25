import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

describe("Sidebar", () => {
  it("renders all navigation links", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Courses")).toBeInTheDocument();
    expect(screen.getByText("Rewards")).toBeInTheDocument();
    expect(screen.getByText("Credentials")).toBeInTheDocument();
  });

  it("marks the active route", () => {
    render(<Sidebar />);
    const dashboard = screen.getByText("Dashboard").closest("a");
    expect(dashboard).toHaveClass("bg-primary-100");
  });
});

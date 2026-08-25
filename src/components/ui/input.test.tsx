import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("forwards type and disabled props", () => {
    render(<Input type="password" disabled aria-label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Input className="w-64" aria-label="Search" />);
    expect(screen.getByLabelText("Search")).toHaveClass("w-64");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is set", async () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Go</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(handler).not.toHaveBeenCalled();
  });

  it.each([
    ["default", "bg-primary-600"],
    ["secondary", "bg-gray-100"],
    ["outline", "border"],
    ["ghost", "bg-transparent"],
    ["destructive", "bg-red-600"],
  ] as const)("variant=%s applies correct class", (variant, cls) => {
    render(<Button variant={variant}>v</Button>);
    expect(screen.getByRole("button").className).toContain(cls);
  });

  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
    ["icon", "w-10"],
  ] as const)("size=%s applies correct class", (size, cls) => {
    render(<Button size={size}>s</Button>);
    expect(screen.getByRole("button").className).toContain(cls);
  });

  it("merges custom className", () => {
    render(<Button className="custom-class">x</Button>);
    expect(screen.getByRole("button").className).toContain("custom-class");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLButtonElement>;
    render(<Button ref={ref}>ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

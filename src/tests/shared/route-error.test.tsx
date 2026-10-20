import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouteError } from "@/components/shared/route-error";

describe("RouteError", () => {
  const error = Object.assign(new Error("Something broke"), { digest: "abc" });

  it("renders the error heading", () => {
    render(<RouteError error={error} reset={vi.fn()} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders the error message", () => {
    render(<RouteError error={error} reset={vi.fn()} />);
    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });

  it("renders the Try Again button", () => {
    render(<RouteError error={error} reset={vi.fn()} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset when Try Again is clicked", async () => {
    const reset = vi.fn();
    render(<RouteError error={error} reset={reset} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("shows fallback text when error has no message", () => {
    const emptyError = Object.assign(new Error(""), { digest: undefined });
    render(<RouteError error={emptyError} reset={vi.fn()} />);
    expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument();
  });
});

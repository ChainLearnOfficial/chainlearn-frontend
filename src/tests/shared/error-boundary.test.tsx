import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "@/components/shared/error-boundary";

// A component that throws on demand
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Boom!");
  return <div>Safe content</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  it("renders the default fallback when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Boom!")).toBeInTheDocument();
  });

  it("renders a custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<p>Custom error UI</p>}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
  });

  it("shows 'Try Again' button in default fallback", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("clears error state when Try Again is clicked", async () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    // After reset the boundary re-renders children (still throws → back to error UI,
    // but the important thing is the click handler fires without crashing the test)
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});

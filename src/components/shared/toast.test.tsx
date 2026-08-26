import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast } from "@/components/shared/toast";

describe("Toast", () => {
  it("renders message with default info variant", () => {
    render(<Toast message="Hello toast" onClose={vi.fn()} autoClose={0} />);
    expect(screen.getByText("Hello toast")).toBeInTheDocument();
  });

  it("applies success and error variants", () => {
    const { rerender, container } = render(
      <Toast message="Saved" variant="success" onClose={vi.fn()} autoClose={0} />
    );
    expect(container.firstChild).toHaveClass("bg-green-50");

    rerender(
      <Toast message="Failed" variant="error" onClose={vi.fn()} autoClose={0} />
    );
    expect(container.firstChild).toHaveClass("bg-red-50");
  });

  it("calls onClose when dismiss button is clicked", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onClose = vi.fn();

    render(<Toast message="Dismiss me" onClose={onClose} autoClose={0} />);
    await user.click(screen.getByRole("button"));

    vi.advanceTimersByTime(300);
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

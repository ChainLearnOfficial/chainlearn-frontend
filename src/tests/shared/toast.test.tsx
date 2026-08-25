import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast } from "@/components/shared/toast";

describe("Toast", () => {
  it("renders the message", () => {
    render(<Toast message="Hello world" onClose={vi.fn()} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it.each([
    ["success", "border-green-200"],
    ["error", "border-red-200"],
    ["warning", "border-amber-200"],
    ["info", "border-blue-200"],
  ] as const)("variant=%s applies correct border class", (variant, cls) => {
    const { container } = render(
      <Toast message="msg" variant={variant} onClose={vi.fn()} />,
    );
    expect((container.firstChild as HTMLElement).className).toContain(cls);
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    // autoClose=0 prevents the auto-dismiss timer from interfering.
    // We use real timers here; the animation setTimeout is only 300ms
    // and waitFor will poll until onClose fires.
    render(<Toast message="msg" onClose={onClose} autoClose={0} />);
    await userEvent.click(screen.getByRole("button"));
    // The component calls onClose via setTimeout(fn, 300) after hiding.
    // Wait up to 1 s for it to fire.
    await new Promise<void>((res) => setTimeout(res, 350));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("auto-closes after the specified delay", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="auto" onClose={onClose} autoClose={2000} />);
    act(() => vi.advanceTimersByTime(2000));
    act(() => vi.advanceTimersByTime(300));
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("does not auto-close when autoClose=0", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="stay" onClose={onClose} autoClose={0} />);
    act(() => vi.advanceTimersByTime(10000));
    expect(onClose).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("renders an action button and invokes its handler", async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    render(
      <Toast
        message="Reward claimed"
        onClose={onClose}
        autoClose={0}
        action={{ label: "View Transaction", onClick: onAction }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "View Transaction" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("dismisses via swipe past the threshold", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="swipe" onClose={onClose} autoClose={0} />);
    const toastEl = screen.getByRole("status");

    fireEvent.pointerDown(toastEl, { clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(toastEl, { clientX: 150 });
    fireEvent.pointerUp(toastEl);

    act(() => vi.advanceTimersByTime(300));
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("snaps back without dismissing when swipe is below threshold", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="swipe" onClose={onClose} autoClose={0} />);
    const toastEl = screen.getByRole("status");

    fireEvent.pointerDown(toastEl, { clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(toastEl, { clientX: 20 });
    fireEvent.pointerUp(toastEl);

    act(() => vi.advanceTimersByTime(300));
    expect(onClose).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

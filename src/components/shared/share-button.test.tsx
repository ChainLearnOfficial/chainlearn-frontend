import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ShareButton } from "@/components/shared/share-button";

describe("ShareButton", () => {
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders the share button trigger", () => {
    render(<ShareButton url="https://example.com/share-test" />);
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("opens modal and handles copy and timeout cleanup", async () => {
    render(<ShareButton url="https://example.com/share-test" />);

    const shareBtn = screen.getByRole("button", { name: /share/i });
    fireEvent.click(shareBtn);

    const copyBtn = screen.getByRole("button", { name: /copy/i });
    expect(copyBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith("https://example.com/share-test");
  });

  it("clears timeout on component unmount", async () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const { unmount } = render(<ShareButton url="https://example.com/unmount-test" />);

    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    const copyBtn = screen.getByRole("button", { name: /copy/i });

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

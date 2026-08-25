import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClaimButton } from "@/components/rewards/claim-button";

describe("ClaimButton", () => {
  const defaultProps = {
    claimableId: "claim-1",
    amount: "50",
    sourceTitle: "Intro to Stellar",
    onClaim: vi.fn().mockResolvedValue(undefined),
  };

  it("renders claim button with amount", () => {
    render(<ClaimButton {...defaultProps} />);
    expect(screen.getByRole("button", { name: /Claim 50 LEARN/i })).toBeInTheDocument();
  });

  it("shows loading state while claiming", async () => {
    let resolve: () => void;
    const slowClaim = () =>
      new Promise<void>((res) => {
        resolve = res;
      });

    render(<ClaimButton {...defaultProps} onClaim={slowClaim} />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText(/Claiming/i)).toBeInTheDocument();
    resolve!();
  });

  it("shows Claimed! after successful claim", async () => {
    render(<ClaimButton {...defaultProps} />);
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByText("Claimed!")).toBeInTheDocument()
    );
  });

  it("button is disabled after claim", async () => {
    render(<ClaimButton {...defaultProps} />);
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("button")).toBeDisabled());
  });

  it("calls onClaim with the correct claimableId", async () => {
    const onClaim = vi.fn().mockResolvedValue(undefined);
    render(<ClaimButton {...defaultProps} onClaim={onClaim} />);
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(onClaim).toHaveBeenCalledWith("claim-1"));
  });

  it("stays claimable when onClaim rejects", async () => {
    const onClaim = vi.fn().mockRejectedValue(new Error("tx failed"));
    render(<ClaimButton {...defaultProps} onClaim={onClaim} />);
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Claim/i })).toBeInTheDocument()
    );
  });
});

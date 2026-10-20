import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClaimButton } from "@/components/rewards/claim-button";

describe("ClaimButton", () => {
  it("renders claim amount", () => {
    render(
      <ClaimButton
        claimableId="claim-1"
        amount="25"
        sourceTitle="Quiz"
        onClaim={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /Claim 25 LEARN/i })).toBeInTheDocument();
  });

  it("calls onClaim and shows claimed state", async () => {
    const user = userEvent.setup();
    const onClaim = vi.fn().mockResolvedValue(undefined);

    render(
      <ClaimButton
        claimableId="claim-1"
        amount="25"
        sourceTitle="Quiz"
        onClaim={onClaim}
      />
    );

    await user.click(screen.getByRole("button", { name: /Claim 25 LEARN/i }));

    await waitFor(() => {
      expect(onClaim).toHaveBeenCalledWith("claim-1");
      expect(screen.getByText("Claimed!")).toBeInTheDocument();
    });
  });

  it("shows loading state while claiming", async () => {
    const user = userEvent.setup();
    let resolveClaim!: () => void;
    const onClaim = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveClaim = resolve;
        })
    );

    render(
      <ClaimButton
        claimableId="claim-1"
        amount="10"
        sourceTitle="Course"
        onClaim={onClaim}
      />
    );

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Claiming...")).toBeInTheDocument();
    resolveClaim();
    await waitFor(() => {
      expect(screen.getByText("Claimed!")).toBeInTheDocument();
    });
  });
});

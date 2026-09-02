import { beforeEach, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RewardHistory } from "@/components/rewards/reward-history";
import { useAuthStore } from "@/store/auth-store";
import type { RewardClaim } from "@/types/stellar";

const claims: RewardClaim[] = [
  {
    id: "r1",
    txHash: "abc123",
    amount: "50000000",
    tokenCode: "LEARN",
    claimedAt: "2024-03-01T00:00:00Z",
    status: "confirmed",
    courseTitle: "Intro to Stellar",
  },
  {
    id: "r2",
    txHash: "",
    amount: "25000000",
    tokenCode: "LEARN",
    claimedAt: "2024-03-02T00:00:00Z",
    status: "pending",
    courseTitle: "Quiz Bonus",
  },
];

describe("RewardHistory", () => {
  beforeEach(() => {
    useAuthStore.setState({ network: "testnet" });
  });

  it("renders empty state when no claims", () => {
    render(<RewardHistory claims={[]} />);
    expect(screen.getByText("No reward history yet.")).toBeInTheDocument();
  });

  it("renders claim rows with amounts and titles", () => {
    render(<RewardHistory claims={claims} />);
    expect(screen.getByText("Intro to Stellar")).toBeInTheDocument();
    expect(screen.getByText("Quiz Bonus")).toBeInTheDocument();
    expect(screen.getByText(/\+5 LEARN/)).toBeInTheDocument();
  });

  it("links confirmed claims to stellar.expert", () => {
    render(<RewardHistory claims={claims} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://stellar.expert/explorer/testnet/tx/abc123"
    );
  });

  it("shows summary stats for total earned, confirmed, pending and failed", () => {
    const mixed = [
      ...claims,
      {
        id: "r3",
        txHash: "",
        amount: "10000000",
        tokenCode: "LEARN",
        claimedAt: "2024-03-03T00:00:00Z",
        status: "failed",
        courseTitle: "Failed Quiz",
      },
    ] as RewardClaim[];
    render(<RewardHistory claims={mixed} />);
    expect(screen.getByText("Total earned")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RewardHistory } from "@/components/rewards/reward-history";
import type { RewardClaim } from "@/types/stellar";

// Stub the auth store so we don't need a full Zustand setup
vi.mock("@/store/auth-store", () => ({
  useAuthStore: (selector: (s: { network: string }) => unknown) =>
    selector({ network: "testnet" }),
}));

const claims: RewardClaim[] = [
  {
    id: "r1",
    txHash: "abc123",
    amount: "500000000",
    tokenCode: "LEARN",
    claimedAt: "2024-04-01T00:00:00Z",
    status: "confirmed",
    courseTitle: "Intro to Stellar",
  },
  {
    id: "r2",
    txHash: "",
    amount: "250000000",
    tokenCode: "LEARN",
    claimedAt: "2024-05-01T00:00:00Z",
    status: "pending",
    courseTitle: "Advanced Soroban",
  },
  {
    id: "r3",
    txHash: "dead",
    amount: "0",
    tokenCode: "LEARN",
    claimedAt: "2024-06-01T00:00:00Z",
    status: "failed",
  },
];

describe("RewardHistory", () => {
  it("shows empty state when claims array is empty", () => {
    render(<RewardHistory claims={[]} />);
    expect(screen.getByText(/No reward history yet/i)).toBeInTheDocument();
  });

  it("renders a row for each claim", () => {
    render(<RewardHistory claims={claims} />);
    expect(screen.getByText("Intro to Stellar")).toBeInTheDocument();
    expect(screen.getByText("Advanced Soroban")).toBeInTheDocument();
  });

  it("falls back to 'Reward' when courseTitle is absent", () => {
    render(<RewardHistory claims={claims} />);
    expect(screen.getByText("Reward")).toBeInTheDocument();
  });

  it("renders an explorer link for confirmed claims with txHash", () => {
    render(<RewardHistory claims={claims} />);
    const links = screen.getAllByRole("link");
    // The confirmed claim has txHash abc123
    expect(links.some((l) => l.getAttribute("href")?.includes("abc123"))).toBe(true);
  });

  it("does not render explorer link when txHash is empty", () => {
    render(<RewardHistory claims={[claims[1]!]} />); // pending, no txHash
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <RewardHistory claims={claims} className="custom" />
    );
    expect((container.firstChild as HTMLElement).className).toContain("custom");
  });
});

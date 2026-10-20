import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import type { TokenBalance } from "@/types/stellar";

const balances: TokenBalance[] = [
  {
    tokenCode: "LEARN",
    tokenIssuer: "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMN",
    balance: "50000000",
    decimals: 7,
  },
];

interface RewardsMock {
  balances: TokenBalance[];
  loading: boolean;
  refetch: ReturnType<typeof vi.fn>;
}

const rewardsMock: RewardsMock = {
  balances,
  loading: false,
  refetch: vi.fn(),
};

vi.mock("@/lib/hooks/use-rewards", () => ({
  useRewards: () => rewardsMock,
}));

vi.mock("@/lib/hooks/use-token-price", () => ({
  useTokenPrice: () => ({ usdRate: 0.15, usdLoading: false, error: false }),
}));

describe("BalanceDisplay", () => {
  beforeEach(() => {
    rewardsMock.balances = balances;
    rewardsMock.loading = false;
  });

  it("shows token balance and code", () => {
    render(<BalanceDisplay />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("LEARN")).toBeInTheDocument();
  });

  it("shows USD equivalent", () => {
    render(<BalanceDisplay />);
    // 5 LEARN * $0.15 = $0.75
    const matches = screen.getAllByText((_, el) =>
      (el?.textContent ?? "").includes("≈ $0.75")
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows token decimals", () => {
    render(<BalanceDisplay />);
    expect(screen.getByText(/LEARN decimals: 7/)).toBeInTheDocument();
  });

  it("links to transaction history", () => {
    render(<BalanceDisplay />);
    const link = screen.getByRole("link", { name: /view transactions/i });
    expect(link).toHaveAttribute("href", "/transactions");
  });

  it("copies the issuer address on click", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<BalanceDisplay />);
    await user.click(screen.getByTitle("Copy contract address"));
    expect(writeText).toHaveBeenCalledWith(balances[0].tokenIssuer);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TokenBalance } from "@/components/rewards/token-balance";
import type { TokenBalance as TokenBalanceType } from "@/types/stellar";

describe("TokenBalance", () => {
  const balance: TokenBalanceType = {
    tokenCode: "LEARN",
    balance: "1000000000", // 100 with 7 decimals
    decimals: 7,
  };

  it("renders the token code", () => {
    render(<TokenBalance balance={balance} />);
    expect(screen.getByText("LEARN")).toBeInTheDocument();
  });

  it("renders the formatted balance", () => {
    render(<TokenBalance balance={balance} />);
    // 1000000000 / 10^7 = 100
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders zero balance correctly", () => {
    render(<TokenBalance balance={{ ...balance, balance: "0" }} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <TokenBalance balance={balance} className="my-class" />
    );
    expect((container.firstChild as HTMLElement).className).toContain("my-class");
  });

  it("renders a different token code", () => {
    render(<TokenBalance balance={{ ...balance, tokenCode: "XLM" }} />);
    expect(screen.getByText("XLM")).toBeInTheDocument();
  });
});

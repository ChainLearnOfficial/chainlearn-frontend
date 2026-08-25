import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TokenBalance } from "@/components/rewards/token-balance";
import type { TokenBalance as TokenBalanceType } from "@/types/stellar";

const mockBalance: TokenBalanceType = {
  tokenCode: "LEARN",
  balance: "100000000", // 10 LEARN with 7 decimals
  decimals: 7,
};

describe("TokenBalance", () => {
  it("renders token code and formatted balance", () => {
    render(<TokenBalance balance={mockBalance} />);
    expect(screen.getByText("LEARN")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <TokenBalance balance={mockBalance} className="mt-4" />
    );
    expect(container.firstChild).toHaveClass("mt-4");
  });
});

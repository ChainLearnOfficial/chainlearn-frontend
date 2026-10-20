import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookOpen } from "lucide-react";
import { StatsCard } from "@/components/shared/stats-card";

describe("StatsCard", () => {
  it("renders the value and label", () => {
    render(<StatsCard icon={BookOpen} label="Enrolled Courses" value={4} />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Enrolled Courses")).toBeInTheDocument();
  });

  it("renders string values", () => {
    render(<StatsCard icon={BookOpen} label="Tokens" value="1,250" />);
    expect(screen.getByText("1,250")).toBeInTheDocument();
  });

  it("shows no trend indicator by default", () => {
    render(<StatsCard icon={BookOpen} label="Courses" value={2} />);
    expect(screen.queryByText(/trending|change/i)).not.toBeInTheDocument();
  });

  it("renders an up trend with label", () => {
    render(
      <StatsCard
        icon={BookOpen}
        label="Courses"
        value={2}
        trend="up"
        trendLabel="12% this week"
      />
    );
    expect(screen.getByText("12% this week")).toBeInTheDocument();
  });

  it("renders a down trend with the default label", () => {
    render(<StatsCard icon={BookOpen} label="Courses" value={2} trend="down" />);
    expect(screen.getByText("Trending down")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <StatsCard
        icon={BookOpen}
        label="Courses"
        value={2}
        className="my-class"
      />
    );
    expect((container.firstChild as HTMLElement).className).toContain("my-class");
  });

  it.each([
    ["primary", "bg-primary-100"],
    ["success", "bg-green-100"],
    ["warning", "bg-yellow-100"],
    ["danger", "bg-red-100"],
    ["purple", "bg-stellar-purple/10"],
    ["muted", "bg-gray-100"],
  ] as const)("color=%s applies the icon container theme", (color, cls) => {
    const { container } = render(
      <StatsCard icon={BookOpen} label="Courses" value={2} color={color} />
    );
    expect((container.querySelector("[aria-hidden='true']") as HTMLElement).className).toContain(
      cls
    );
  });
});
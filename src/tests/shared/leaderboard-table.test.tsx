import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LeaderboardTable } from "@/components/shared/leaderboard-table";
import type { LeaderboardEntry } from "@/components/shared/leaderboard-table";

const entries: LeaderboardEntry[] = [
  { id: "a", name: "Alice", score: 1250 },
  { id: "b", name: "Bob", score: 980 },
  { id: "c", name: "Carol", score: 760 },
];

describe("LeaderboardTable", () => {
  it("renders a table with rank, name and score columns", () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByRole("table", { name: /leaderboard/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /rank/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /score/i })).toBeInTheDocument();
  });

  it("renders each entry with its rank and score", () => {
    render(<LeaderboardTable entries={entries} />);
    const rows = screen.getAllByRole("row");
    // header + 3 entries
    expect(rows).toHaveLength(4);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("1,250")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("highlights the current user and marks them with a You badge", () => {
    render(<LeaderboardTable entries={entries} currentUserId="b" />);
    const bobRow = screen.getByText("Bob").closest("tr");
    expect(bobRow).not.toBeNull();
    expect(bobRow!.className).toContain("bg-primary-50");
    expect(within(bobRow!).getByText("You")).toBeInTheDocument();
  });

  it("does not render a You badge without a current user", () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.queryByText("You")).not.toBeInTheDocument();
  });

  it("renders rank medallions for the top three", () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByLabelText("Rank 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Rank 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Rank 3")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <LeaderboardTable entries={entries} className="my-class" />
    );
    expect(
      (container.querySelector("table") as HTMLElement).className
    ).toContain("my-class");
  });
});
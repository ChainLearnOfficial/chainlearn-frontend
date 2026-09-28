import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatAddress,
  formatDate,
  formatDateTime,
  formatDuration,
  formatLargeNumber,
  formatPercentage,
  formatRelativeTime,
  formatTokenAmount,
} from "@/lib/utils/format";

afterEach(() => {
  vi.useRealTimers();
});

describe("number formatting utilities", () => {
  it("formats token amounts, percentages, compact counts, and addresses", () => {
    expect(formatTokenAmount(1234.5)).toBe("1,234.5 LEARN");
    expect(formatPercentage(0.75)).toBe("75%");
    expect(formatPercentage(75, { isPercentValue: true })).toBe("75%");
    expect(formatLargeNumber(1200)).toBe("1.2K");
    expect(formatAddress("G".padEnd(56, "A"))).toBe("GAAA...AAAA");
  });

  it("returns an empty string for non-finite values", () => {
    expect(formatTokenAmount(Number.NaN)).toBe("");
    expect(formatPercentage(Number.POSITIVE_INFINITY)).toBe("");
    expect(formatLargeNumber(Number.NaN)).toBe("");
  });
});

describe("date formatting utilities", () => {
  it("formats dates and date-times in the requested timezone", () => {
    const timestamp = "2024-01-15T00:30:00.000Z";
    expect(formatDate(timestamp, { timeZone: "UTC" })).toBe("Jan 15, 2024");
    expect(formatDate(timestamp, { timeZone: "America/Los_Angeles" })).toBe("Jan 14, 2024");
    expect(formatDateTime(timestamp, { timeZone: "UTC" })).toBe("Jan 15, 2024, 12:30 AM");
    expect(formatDate("not a date")).toBe("");
  });

  it("formats relative times and falls back to a date for older timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));

    expect(formatRelativeTime(new Date("2024-01-15T10:00:00.000Z"))).toBe("2 hours ago");
    expect(formatRelativeTime(new Date("2024-01-05T12:00:00.000Z"), { timeZone: "UTC" })).toBe("Jan 5, 2024");
    expect(formatRelativeTime("invalid")).toBe("");
  });

  it("formats minute durations as days, hours, and minutes", () => {
    expect(formatDuration(3065)).toBe("2d 3h 5m");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(-1)).toBe("0m");
  });
});
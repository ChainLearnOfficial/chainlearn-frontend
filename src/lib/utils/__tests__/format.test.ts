import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  capitalize,
  truncate,
  pluralize,
  slugify,
  formatUSD,
  formatCurrency,
  formatPrice,
  formatNumber,
  formatCompactNumber,
  formatPercent,
} from "../format";

describe("formatDate", () => {
  it("formats a date string", () => {
    expect(formatDate("2024-01-15T00:00:00Z", { timeZone: "UTC" })).toBe(
      "Jan 15, 2024"
    );
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("formats a date and time", () => {
    expect(
      formatDateTime("2024-01-15T14:30:00Z", { timeZone: "UTC" })
    ).toBe("Jan 15, 2024, 2:30 PM");
  });
});

describe("formatRelativeTime", () => {
  it("returns 'Just now' for very recent timestamps", () => {
    expect(formatRelativeTime(new Date())).toBe("Just now");
  });

  it("formats minutes in the past", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("5 minutes ago");
  });

  it("formats hours in the future", () => {
    const date = new Date(Date.now() + 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("in 2 hours");
  });
});

describe("formatDuration", () => {
  it("formats minutes under an hour", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(135)).toBe("2h 15m");
  });

  it("formats whole hours without minutes", () => {
    expect(formatDuration(120)).toBe("2h");
  });
});

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("stellar")).toBe("Stellar");
  });

  it("handles empty strings", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("truncate", () => {
  it("truncates long text with an ellipsis", () => {
    expect(truncate("Course Title Goes Here", 12)).toBe("Course Ti...");
  });

  it("returns short text unchanged", () => {
    expect(truncate("Short", 12)).toBe("Short");
  });

  it("handles empty strings", () => {
    expect(truncate("", 12)).toBe("");
  });
});

describe("pluralize", () => {
  it("uses the singular for a count of 1", () => {
    expect(pluralize(1, "item")).toBe("1 item");
  });

  it("appends 's' for other counts", () => {
    expect(pluralize(3, "item")).toBe("3 items");
  });

  it("supports an irregular plural", () => {
    expect(pluralize(2, "category", "categories")).toBe("2 categories");
  });
});

describe("slugify", () => {
  it("converts text to a URL-friendly slug", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("handles special characters and extra whitespace", () => {
    expect(slugify("  Stellar & Web3  Course ")).toBe("stellar-web3-course");
  });

  it("handles empty strings", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatUSD", () => {
  it("formats a USD value", () => {
    expect(formatUSD(1234.5)).toBe("$1,234.50");
  });
});

describe("formatCurrency", () => {
  it("formats a value with the given currency code", () => {
    expect(formatCurrency(10, "EUR", { locale: "en-US" })).toBe("€10.00");
  });
});

describe("formatPrice", () => {
  it("formats a standard price like currency", () => {
    expect(formatPrice(1.5)).toBe("$1.50");
  });

  it("shows extra decimals for sub-cent values", () => {
    expect(formatPrice(0.0001234)).toBe("$0.000123");
  });
});

describe("formatNumber", () => {
  it("adds thousands separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
  it("respects maximumFractionDigits", () => {
    expect(formatNumber(1.23456, { maximumFractionDigits: 2 })).toBe("1.23");
  });
  it("returns empty string for non-finite input", () => {
    expect(formatNumber(NaN)).toBe("");
    expect(formatNumber(Infinity)).toBe("");
  });
});

describe("formatCompactNumber", () => {
  it("compacts thousands and millions", () => {
    expect(formatCompactNumber(1234)).toBe("1.2K");
    expect(formatCompactNumber(2_500_000)).toBe("2.5M");
  });
  it("leaves small numbers alone", () => {
    expect(formatCompactNumber(42)).toBe("42");
  });
  it("returns empty string for non-finite input", () => {
    expect(formatCompactNumber(NaN)).toBe("");
  });
});

describe("formatPercent", () => {
  it("formats a ratio as a percentage", () => {
    expect(formatPercent(0.256)).toBe("25.6%");
  });
  it("accepts values already in percent units", () => {
    expect(formatPercent(25.6, { isPercentValue: true })).toBe("25.6%");
  });
  it("returns empty string for non-finite input", () => {
    expect(formatPercent(NaN)).toBe("");
  });
});

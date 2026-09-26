/**
 * Truncate a Stellar address for display: show first 4 and last 4 chars.
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format a token balance string with the given number of decimal places.
 */
export function formatTokenBalance(
  balance: string | number,
  decimals = 7,
  displayDecimals = 2
): string {
  const num = typeof balance === "string" ? parseFloat(balance) : balance;
  if (isNaN(num)) return "0";
  const adjusted = num / Math.pow(10, decimals);
  return adjusted.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

/**
 * Format a date string or Date to a human-readable format, e.g. "Jan 15, 2024".
 */
export function formatDate(
  date: string | number | Date,
  options?: { timeZone?: string; locale?: string }
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(options?.locale ?? "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: options?.timeZone,
  }).format(d);
}

/**
 * Format a date string or Date to a human-readable date + time, e.g.
 * "Jan 15, 2024, 2:30 PM".
 */
export function formatDateTime(
  date: string | number | Date,
  options?: { timeZone?: string; locale?: string }
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(options?.locale ?? "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: options?.timeZone,
  }).format(d);
}

/**
 * Format a timestamp as a relative time (e.g. "5 minutes ago", "in 3 days"),
 * falling back to the full date for anything older than a week.
 */
export function formatRelativeTime(
  date: string | number | Date,
  options?: { locale?: string }
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const seconds = Math.round((d.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 60) return "Just now";

  const rtf = new Intl.RelativeTimeFormat(options?.locale ?? "en-US", {
    numeric: "auto",
  });

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "seconds" },
    { amount: 60, unit: "minutes" },
    { amount: 24, unit: "hours" },
    { amount: 7, unit: "days" },
  ];

  let duration = seconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatDate(d);
}

/**
 * Format minutes into a human-readable duration string, e.g. "2h 15m".
 */
export function formatDuration(minutes: number): string {
  if (!isFinite(minutes) || minutes < 0) return "0m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

/**
 * Format a number with commas (e.g. 1,234).
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text to a maximum length, appending an ellipsis when truncated.
 */
export function truncate(text: string, maxLength: number, suffix = "..."): string {
  if (!text) return "";
  if (maxLength <= 0) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - suffix.length).trimEnd()}${suffix}`;
}

/**
 * Pluralize a word based on a count, e.g. pluralize(1, "item") -> "1 item",
 * pluralize(3, "item") -> "3 items". Accepts an optional explicit plural form
 * for irregular words.
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural ?? `${singular}s`;
  return `${formatNumber(count)} ${word}`;
}

/**
 * Convert a string into a URL-friendly slug, e.g. "Hello, World!" -> "hello-world".
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format a numeric value as USD currency, e.g. formatUSD(1234.5) -> "$1,234.50".
 */
export function formatUSD(value: number, options?: { locale?: string }): string {
  return formatCurrency(value, "USD", options);
}

/**
 * Format a numeric value as currency in the given ISO 4217 currency code.
 */
export function formatCurrency(
  value: number,
  currency = "USD",
  options?: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  if (!isFinite(value)) return "";
  return new Intl.NumberFormat(options?.locale ?? "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
  }).format(value);
}

/**
 * Format a price value, using more decimal places for very small amounts
 * (e.g. sub-cent token prices) and standard currency formatting otherwise.
 */
export function formatPrice(value: number, currency = "USD", options?: { locale?: string }): string {
  if (!isFinite(value)) return "";
  if (value > 0 && value < 0.01) {
    return formatCurrency(value, currency, {
      ...options,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }
  return formatCurrency(value, currency, options);
}

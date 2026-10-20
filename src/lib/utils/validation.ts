/**
 * Shared validation utilities for form inputs.
 *
 * Centralises validation rules so pages don't duplicate inline checks.
 */

/** Minimum length for a display name. */
export const DISPLAY_NAME_MIN_LENGTH = 2;

/** Maximum length for a display name. */
export const DISPLAY_NAME_MAX_LENGTH = 50;

/**
 * Validate a display name.
 *
 * Returns `null` when valid, or a human-readable error message.
 */
export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Display name is required.";
  if (trimmed.length < DISPLAY_NAME_MIN_LENGTH) {
    return `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters.`;
  }
  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`;
  }
  return null;
}

/**
 * Check whether a display name is valid (convenience wrapper).
 */
export function isValidDisplayName(name: string): boolean {
  return validateDisplayName(name) === null;
}

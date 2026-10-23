export function encodePathParam(value: string, name: string): string {
  if (!value.trim() || value === "." || value === "..") {
    throw new TypeError(`${name} must be a non-empty path identifier.`);
  }
  return encodeURIComponent(value);
}
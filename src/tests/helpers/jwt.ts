/**
 * Build a structurally valid JWT with the given payload.
 *
 * The signature is a placeholder: nothing client-side verifies it, and these
 * helpers exist to exercise expiry handling, not cryptography.
 */
export function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return [
    encode({ alg: "HS256", typ: "JWT" }),
    encode(payload),
    "signature-not-verified-client-side",
  ].join(".");
}

/** In-memory Storage stand-in for zustand's persist middleware under jsdom. */
export function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  } as Storage;
}

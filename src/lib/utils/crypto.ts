/**
 * Client-side hashing, signing, and verification helpers built on the Web
 * Crypto API (`crypto.subtle`), available in both browsers and the Node
 * runtime used by tests. These are for request signing and data-integrity
 * checks, not for anything requiring a secret to stay confidential from the
 * client itself.
 */

/** Resolve the SubtleCrypto implementation for the current runtime. */
function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API is not available in this environment");
  }
  return subtle;
}

function toArrayBuffer(data: string | ArrayBuffer | Uint8Array): ArrayBuffer {
  if (typeof data === "string") {
    return new TextEncoder().encode(data).buffer as ArrayBuffer;
  }
  if (data instanceof Uint8Array) {
    return data.buffer as ArrayBuffer;
  }
  return data;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): ArrayBuffer {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Compute the SHA-256 digest of the given data, returned as a lowercase hex
 * string.
 */
export async function sha256(data: string | ArrayBuffer | Uint8Array): Promise<string> {
  const digest = await getSubtle().digest("SHA-256", toArrayBuffer(data));
  return bufferToHex(digest);
}

async function importHmacKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return getSubtle().importKey(
    "raw",
    toArrayBuffer(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

/**
 * Sign the given data with HMAC-SHA256 using `secret`, returning the
 * signature as a lowercase hex string.
 */
export async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret, ["sign"]);
  const signature = await getSubtle().sign("HMAC", key, toArrayBuffer(data));
  return bufferToHex(signature);
}

/**
 * Verify an HMAC-SHA256 `signature` (as a lowercase hex string) over `data`
 * using `secret`. Uses `SubtleCrypto.verify`, which performs a
 * constant-time comparison.
 */
export async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const key = await importHmacKey(secret, ["verify"]);
    return await getSubtle().verify("HMAC", key, hexToBuffer(signature), toArrayBuffer(data));
  } catch {
    return false;
  }
}

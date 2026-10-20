import { describe, it, expect } from "vitest";
import { sha256, hmacSign, verifySignature } from "../crypto";

describe("sha256", () => {
  it("hashes a known string to its expected digest", async () => {
    expect(await sha256("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });

  it("produces the same digest for the same input", async () => {
    expect(await sha256("stellar")).toBe(await sha256("stellar"));
  });

  it("produces different digests for different input", async () => {
    expect(await sha256("a")).not.toBe(await sha256("b"));
  });
});

describe("hmacSign / verifySignature", () => {
  it("produces a signature that verifies against the same secret", async () => {
    const signature = await hmacSign("payload", "secret");
    expect(await verifySignature("payload", signature, "secret")).toBe(true);
  });

  it("fails verification with a different secret", async () => {
    const signature = await hmacSign("payload", "secret");
    expect(await verifySignature("payload", signature, "wrong-secret")).toBe(
      false
    );
  });

  it("fails verification when the data is tampered with", async () => {
    const signature = await hmacSign("payload", "secret");
    expect(await verifySignature("tampered", signature, "secret")).toBe(
      false
    );
  });

  it("fails verification for a malformed signature", async () => {
    expect(await verifySignature("payload", "not-hex", "secret")).toBe(false);
  });
});

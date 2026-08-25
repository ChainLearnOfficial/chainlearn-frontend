import { describe, expect, it } from "vitest";

import {
  decodeJwt,
  getTimeUntilExpiry,
  getTokenExpiry,
  isTokenExpired,
  shouldRefreshToken,
} from "./jwt";
import { makeJwt } from "@/tests/helpers/jwt";

const HOUR = 60 * 60 * 1000;
const NOW = Date.parse("2026-01-01T12:00:00.000Z");

describe("decodeJwt", () => {
  it("decodes the payload", () => {
    const token = makeJwt({ sub: "GABC", exp: 1_800_000_000 });
    expect(decodeJwt(token)).toMatchObject({ sub: "GABC", exp: 1_800_000_000 });
  });

  it("decodes payloads containing base64url characters", () => {
    // '+' and '/' in standard base64 become '-' and '_' in base64url; a naive
    // decoder mangles these.
    const token = makeJwt({ sub: "a?b>c~d", nested: { ok: true } });
    expect(decodeJwt(token)).toMatchObject({ sub: "a?b>c~d" });
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty string", ""],
    ["not a jwt", "just-a-string"],
    ["two segments", "header.payload"],
    ["four segments", "a.b.c.d"],
  ])("returns null for %s", (_label, token) => {
    expect(decodeJwt(token as string | null | undefined)).toBeNull();
  });

  it("returns null when the payload is not valid base64", () => {
    expect(decodeJwt("header.!!!not-base64!!!.sig")).toBeNull();
  });

  it("returns null when the payload is not JSON", () => {
    const notJson = Buffer.from("plain text").toString("base64url");
    expect(decodeJwt(`header.${notJson}.sig`)).toBeNull();
  });

  it("returns null when the payload is a JSON array", () => {
    const arr = Buffer.from(JSON.stringify([1, 2])).toString("base64url");
    expect(decodeJwt(`header.${arr}.sig`)).toBeNull();
  });

  it("returns null when the payload is a JSON primitive", () => {
    const prim = Buffer.from(JSON.stringify("nope")).toString("base64url");
    expect(decodeJwt(`header.${prim}.sig`)).toBeNull();
  });
});

describe("getTokenExpiry", () => {
  it("converts the exp claim from seconds to milliseconds", () => {
    expect(getTokenExpiry(makeJwt({ exp: 1_800_000_000 }))).toBe(
      1_800_000_000_000
    );
  });

  it("returns null when exp is absent", () => {
    expect(getTokenExpiry(makeJwt({ sub: "GABC" }))).toBeNull();
  });

  it.each([["a string", "soon"], ["null", null], ["NaN", Number.NaN]])(
    "returns null when exp is %s",
    (_label, exp) => {
      expect(getTokenExpiry(makeJwt({ exp }))).toBeNull();
    }
  );

  it("returns null for a malformed token", () => {
    expect(getTokenExpiry("garbage")).toBeNull();
  });
});

describe("getTimeUntilExpiry", () => {
  it("reports remaining milliseconds", () => {
    const token = makeJwt({ exp: (NOW + 2 * HOUR) / 1000 });
    expect(getTimeUntilExpiry(token, NOW)).toBe(2 * HOUR);
  });

  it("goes negative once expired", () => {
    const token = makeJwt({ exp: (NOW - HOUR) / 1000 });
    expect(getTimeUntilExpiry(token, NOW)).toBe(-HOUR);
  });

  it("returns null when expiry is unknown", () => {
    expect(getTimeUntilExpiry(makeJwt({ sub: "x" }), NOW)).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("is false while the token is still valid", () => {
    expect(isTokenExpired(makeJwt({ exp: (NOW + HOUR) / 1000 }), NOW)).toBe(false);
  });

  it("is true once past expiry", () => {
    expect(isTokenExpired(makeJwt({ exp: (NOW - 1000) / 1000 }), NOW)).toBe(true);
  });

  it("is true exactly at expiry", () => {
    expect(isTokenExpired(makeJwt({ exp: NOW / 1000 }), NOW)).toBe(true);
  });

  it("is false when expiry cannot be read", () => {
    // Guessing "expired" would sign users out on a token the backend would
    // still accept.
    expect(isTokenExpired(makeJwt({ sub: "x" }), NOW)).toBe(false);
    expect(isTokenExpired("garbage", NOW)).toBe(false);
  });
});

describe("shouldRefreshToken", () => {
  it("is false well before the window opens", () => {
    const token = makeJwt({ exp: (NOW + 5 * HOUR) / 1000 });
    expect(shouldRefreshToken(token, HOUR, NOW)).toBe(false);
  });

  it("is true inside the window", () => {
    const token = makeJwt({ exp: (NOW + 30 * 60 * 1000) / 1000 });
    expect(shouldRefreshToken(token, HOUR, NOW)).toBe(true);
  });

  it("is true exactly at the window boundary", () => {
    const token = makeJwt({ exp: (NOW + HOUR) / 1000 });
    expect(shouldRefreshToken(token, HOUR, NOW)).toBe(true);
  });

  it("is false one millisecond before the window opens", () => {
    const token = makeJwt({ exp: (NOW + HOUR + 1000) / 1000 });
    expect(shouldRefreshToken(token, HOUR, NOW)).toBe(false);
  });

  it("is false for an already-expired token", () => {
    // The acceptance criterion: refreshing a dead token is a guaranteed-failed
    // request, so it must not be attempted.
    expect(shouldRefreshToken(makeJwt({ exp: (NOW - 1) / 1000 }), HOUR, NOW)).toBe(
      false
    );
  });

  it("is false exactly at expiry", () => {
    expect(shouldRefreshToken(makeJwt({ exp: NOW / 1000 }), HOUR, NOW)).toBe(false);
  });

  it("is false when expiry cannot be read", () => {
    expect(shouldRefreshToken(makeJwt({ sub: "x" }), HOUR, NOW)).toBe(false);
    expect(shouldRefreshToken(null, HOUR, NOW)).toBe(false);
  });
});

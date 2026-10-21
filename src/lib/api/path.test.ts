import { describe, expect, it } from "vitest";
import { encodePathParam } from "./path";

describe("encodePathParam", () => {
  it("encodes reserved URL characters as a single path segment", () => {
    expect(encodePathParam("id/part?query#fragment", "id")).toBe(
      "id%2Fpart%3Fquery%23fragment"
    );
  });

  it.each([".", ".."])("rejects dot segment %s", (value) => {
    expect(() => encodePathParam(value, "id")).toThrow(
      "id must be a non-empty path identifier"
    );
  });

  it.each(["", "   ", "\t\n"])("rejects blank values", (value) => {
    expect(() => encodePathParam(value, "id")).toThrow(
      "id must be a non-empty path identifier"
    );
  });
});
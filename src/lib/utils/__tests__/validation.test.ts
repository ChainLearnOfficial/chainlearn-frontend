import { describe, it, expect } from "vitest";
import {
  isValidStellarAddress,
  isValidEd25519PublicKey,
  isValidContractId,
  required,
  minLength,
  maxLength,
  stellarAddress,
  displayName,
  composeValidators,
  profileUpdateSchema,
  courseCreateSchema,
  quizSubmitSchema,
  rewardClaimSchema,
} from "../validation";

// Valid fixtures (checksum-verified via stellar-sdk Keypair.random)
const VALID_ADDRESS = "GBO3B63GKPFO2G5RVHJOZJGQVXEXZKRKMNKEH4IDCGTL2OZFJJ3MB5EM";
const VALID_CONTRACT = "CBO3B63GKPFO2G5RVHJOZJGQVXEXZKRKMNKEH4IDCGTL2OZFJJ3MAZBV";
// Same length/prefix but broken checksum (last char swapped)
const BAD_CHECKSUM_ADDRESS =
  "GBO3B63GKPFO2G5RVHJOZJGQVXEXZKRKMNKEH4IDCGTL2OZFJJ3MB5EN";

describe("isValidStellarAddress", () => {
  it("accepts a valid address", () => {
    expect(isValidStellarAddress(VALID_ADDRESS)).toEqual({ valid: true });
  });

  it("rejects null/undefined/empty", () => {
    expect(isValidStellarAddress(null).valid).toBe(false);
    expect(isValidStellarAddress(undefined).valid).toBe(false);
    expect(isValidStellarAddress("").valid).toBe(false);
  });

  it("rejects wrong length", () => {
    const res = isValidStellarAddress("GABC");
    expect(res).toEqual({
      valid: false,
      error: "Stellar address must be 56 characters long",
    });
  });

  it("rejects addresses not starting with G", () => {
    const res = isValidStellarAddress("C" + VALID_ADDRESS.slice(1));
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/must start with 'G'/);
  });

  it("rejects bad checksum", () => {
    const res = isValidStellarAddress(BAD_CHECKSUM_ADDRESS);
    expect(res).toEqual({
      valid: false,
      error: "Invalid Stellar address checksum or format",
    });
  });
});

describe("isValidEd25519PublicKey", () => {
  it("accepts a valid key", () => {
    expect(isValidEd25519PublicKey(VALID_ADDRESS)).toEqual({ valid: true });
  });

  it("rejects null/undefined/empty", () => {
    expect(isValidEd25519PublicKey(null).valid).toBe(false);
    expect(isValidEd25519PublicKey(undefined).valid).toBe(false);
  });

  it("rejects malformed keys", () => {
    expect(isValidEd25519PublicKey("not-a-key")).toEqual({
      valid: false,
      error: "Invalid Ed25519 public key format",
    });
  });
});

describe("isValidContractId", () => {
  it("accepts a valid contract id", () => {
    expect(isValidContractId(VALID_CONTRACT)).toEqual({ valid: true });
  });

  it("rejects null/undefined/empty", () => {
    expect(isValidContractId(null).valid).toBe(false);
    expect(isValidContractId(undefined).valid).toBe(false);
  });

  it("rejects non-contract strings", () => {
    expect(isValidContractId(VALID_ADDRESS)).toEqual({
      valid: false,
      error: "Invalid Soroban contract ID format",
    });
    expect(isValidContractId("garbage")).toEqual({
      valid: false,
      error: "Invalid Soroban contract ID format",
    });
  });
});

describe("required", () => {
  it("accepts non-empty values", () => {
    expect(required("hello")).toEqual({ valid: true });
  });

  it("rejects null/undefined/blank", () => {
    expect(required(null)).toEqual({ valid: false, error: "Field is required" });
    expect(required(undefined)).toEqual({
      valid: false,
      error: "Field is required",
    });
    expect(required("   ")).toEqual({
      valid: false,
      error: "Field is required",
    });
  });

  it("uses a custom field name", () => {
    expect(required("", "Email")).toEqual({
      valid: false,
      error: "Email is required",
    });
  });
});

describe("minLength / maxLength", () => {
  it("minLength passes at boundary and fails below", () => {
    expect(minLength("ab", 2)).toEqual({ valid: true });
    expect(minLength("a", 2, "Name")).toEqual({
      valid: false,
      error: "Name must be at least 2 characters",
    });
  });

  it("maxLength passes at boundary and fails above", () => {
    expect(maxLength("ab", 2)).toEqual({ valid: true });
    expect(maxLength("abc", 2, "Name")).toEqual({
      valid: false,
      error: "Name must be at most 2 characters",
    });
  });
});

describe("stellarAddress", () => {
  it("delegates to isValidStellarAddress", () => {
    expect(stellarAddress(VALID_ADDRESS)).toEqual({ valid: true });
    expect(stellarAddress("bad")?.valid).toBe(false);
  });
});

describe("displayName", () => {
  it("accepts a normal name", () => {
    expect(displayName("Ada")).toEqual({ valid: true });
  });

  it("rejects missing names", () => {
    expect(displayName(null)).toEqual({
      valid: false,
      error: "Display name is required",
    });
  });

  it("rejects names that are too short or too long", () => {
    expect(displayName("A").valid).toBe(false);
    expect(displayName("x".repeat(51))).toEqual({
      valid: false,
      error: "Display name must be at most 50 characters",
    });
  });

  it("rejects control characters and angle brackets", () => {
    for (const bad of ["a<b", "a>b", "a\nb", "a\tb"]) {
      expect(displayName(bad)).toEqual({
        valid: false,
        error: "Display name contains invalid characters",
      });
    }
  });
});

describe("composeValidators", () => {
  it("returns valid when all pass", () => {
    const v = composeValidators(
      (s) => required(s, "X"),
      (s) => minLength(s, 2, "X")
    );
    expect(v("ab")).toEqual({ valid: true });
  });

  it("short-circuits on the first failure", () => {
    const calls: string[] = [];
    const v = composeValidators(
      () => ({ valid: false, error: "first" }),
      (s) => {
        calls.push(s);
        return { valid: true };
      }
    );
    expect(v("x")).toEqual({ valid: false, error: "first" });
    expect(calls).toEqual([]);
  });
});

const validProfile = {
  displayName: "Ada Lovelace",
  background: "Developer",
  learningGoals: ["stellar"],
  preferredPace: "moderate" as const,
};

describe("profileUpdateSchema", () => {
  it("accepts a valid profile", () => {
    expect(profileUpdateSchema.safeParse(validProfile).success).toBe(true);
  });

  it("accepts a valid optional stellarAddress and rejects a bad one", () => {
    expect(
      profileUpdateSchema.safeParse({
        ...validProfile,
        stellarAddress: VALID_ADDRESS,
      }).success
    ).toBe(true);
    const bad = profileUpdateSchema.safeParse({
      ...validProfile,
      stellarAddress: "bad",
    });
    expect(bad.success).toBe(false);
  });

  it("rejects invalid displayName, empty background/goals, bad pace", () => {
    expect(
      profileUpdateSchema.safeParse({ ...validProfile, displayName: "A" })
        .success
    ).toBe(false);
    expect(
      profileUpdateSchema.safeParse({ ...validProfile, background: "" })
        .success
    ).toBe(false);
    expect(
      profileUpdateSchema.safeParse({ ...validProfile, learningGoals: [] })
        .success
    ).toBe(false);
    expect(
      profileUpdateSchema.safeParse({
        ...validProfile,
        preferredPace: "warp",
      }).success
    ).toBe(false);
  });
});

const validCourse = {
  title: "Stellar Basics",
  description: "Learn the Stellar network from scratch.",
  difficulty: "beginner" as const,
  category: "BC",
  estimatedHours: 3,
  rewardTokenAmount: 0,
};

describe("courseCreateSchema", () => {
  it("accepts a valid course (zero reward allowed, image optional)", () => {
    expect(courseCreateSchema.safeParse(validCourse).success).toBe(true);
    expect(
      courseCreateSchema.safeParse({
        ...validCourse,
        imageUrl: "https://example.com/img.png",
      }).success
    ).toBe(true);
  });

  it("rejects short title/description, bad difficulty, non-positive hours, negative reward, bad URL", () => {
    expect(
      courseCreateSchema.safeParse({ ...validCourse, title: "AB" }).success
    ).toBe(false);
    expect(
      courseCreateSchema.safeParse({ ...validCourse, description: "short" })
        .success
    ).toBe(false);
    expect(
      courseCreateSchema.safeParse({ ...validCourse, difficulty: "expert" })
        .success
    ).toBe(false);
    expect(
      courseCreateSchema.safeParse({ ...validCourse, estimatedHours: 0 })
        .success
    ).toBe(false);
    expect(
      courseCreateSchema.safeParse({ ...validCourse, rewardTokenAmount: -1 })
        .success
    ).toBe(false);
    expect(
      courseCreateSchema.safeParse({
        ...validCourse,
        imageUrl: "not-a-url",
      }).success
    ).toBe(false);
  });
});

const validQuiz = {
  quizId: "q1",
  userId: "u1",
  answers: [{ questionId: "qq1", selectedOptionId: "o1" }],
};

describe("quizSubmitSchema", () => {
  it("accepts a valid submission with optional time", () => {
    expect(quizSubmitSchema.safeParse(validQuiz).success).toBe(true);
    expect(
      quizSubmitSchema.safeParse({ ...validQuiz, timeTakenSeconds: 42 })
        .success
    ).toBe(true);
  });

  it("rejects empty ids, empty answers, negative time", () => {
    expect(
      quizSubmitSchema.safeParse({ ...validQuiz, quizId: "" }).success
    ).toBe(false);
    expect(quizSubmitSchema.safeParse({ ...validQuiz, answers: [] }).success).toBe(
      false
    );
    expect(
      quizSubmitSchema.safeParse({
        ...validQuiz,
        answers: [{ questionId: "", selectedOptionId: "o1" }],
      }).success
    ).toBe(false);
    expect(
      quizSubmitSchema.safeParse({ ...validQuiz, timeTakenSeconds: -5 })
        .success
    ).toBe(false);
  });
});

const validClaim = {
  id: "c1",
  txHash: "abc123",
  amount: "100",
  tokenCode: "XLM",
  claimedAt: "2024-01-15T00:00:00Z",
  status: "confirmed" as const,
};

describe("rewardClaimSchema", () => {
  it("accepts a valid claim with optional fields", () => {
    expect(rewardClaimSchema.safeParse(validClaim).success).toBe(true);
    expect(
      rewardClaimSchema.safeParse({
        ...validClaim,
        decimals: 7,
        courseTitle: "Stellar Basics",
      }).success
    ).toBe(true);
  });

  it("rejects empty fields, bad date, bad status", () => {
    expect(rewardClaimSchema.safeParse({ ...validClaim, id: "" }).success).toBe(
      false
    );
    expect(
      rewardClaimSchema.safeParse({ ...validClaim, claimedAt: "yesterday" })
        .success
    ).toBe(false);
    expect(
      rewardClaimSchema.safeParse({ ...validClaim, status: "maybe" }).success
    ).toBe(false);
  });
});

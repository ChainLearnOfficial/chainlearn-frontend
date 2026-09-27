import { StrKey } from "@stellar/stellar-sdk";
import { z } from "zod";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// --- #369: Stellar Address Validators ---

export function isValidStellarAddress(address: string | null | undefined): ValidationResult {
  if (!address) {
    return { valid: false, error: "Stellar address is required" };
  }
  if (address.length !== 56) {
    return { valid: false, error: "Stellar address must be 56 characters long" };
  }
  if (!address.startsWith("G")) {
    return { valid: false, error: "Stellar address must start with 'G'" };
  }
  if (!StrKey.isValidEd25519PublicKey(address)) {
    return { valid: false, error: "Invalid Stellar address checksum or format" };
  }
  return { valid: true };
}

export function isValidEd25519PublicKey(key: string | null | undefined): ValidationResult {
  if (!key) {
    return { valid: false, error: "Public key is required" };
  }
  if (!StrKey.isValidEd25519PublicKey(key)) {
    return { valid: false, error: "Invalid Ed25519 public key format" };
  }
  return { valid: true };
}

export function isValidContractId(contractId: string | null | undefined): ValidationResult {
  if (!contractId) {
    return { valid: false, error: "Contract ID is required" };
  }
  if (!StrKey.isValidContract(contractId)) {
    return { valid: false, error: "Invalid Soroban contract ID format" };
  }
  return { valid: true };
}

// --- #368: Form Field Validators ---

export function required(value: string | null | undefined, fieldName = "Field"): ValidationResult {
  if (!value || value.trim() === "") {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function minLength(value: string, min: number, fieldName = "Field"): ValidationResult {
  if (value.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  return { valid: true };
}

export function maxLength(value: string, max: number, fieldName = "Field"): ValidationResult {
  if (value.length > max) {
    return { valid: false, error: `${fieldName} must be at most ${max} characters` };
  }
  return { valid: true };
}

export function stellarAddress(value: string | null | undefined): ValidationResult {
  return isValidStellarAddress(value);
}

export function displayName(value: string | null | undefined): ValidationResult {
  const req = required(value, "Display name");
  if (!req.valid) return req;
  
  const val = value!;
  const min = minLength(val, 2, "Display name");
  if (!min.valid) return min;

  const max = maxLength(val, 50, "Display name");
  if (!max.valid) return max;

  if (/[\r\n\t\0<>]/.test(val)) {
    return { valid: false, error: "Display name contains invalid characters" };
  }

  return { valid: true };
}

export function composeValidators(...validators: Array<(val: string) => ValidationResult>): (val: string) => ValidationResult {
  return (val: string) => {
    for (const validator of validators) {
      const result = validator(val);
      if (!result.valid) return result;
    }
    return { valid: true };
  };
}

// --- #370: Zod Schemas ---

export const profileUpdateSchema = z.object({
  displayName: z.string().superRefine((val, ctx) => {
    const res = displayName(val);
    if (!res.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: res.error,
      });
    }
  }),
  background: z.string().min(1, "Background is required"),
  learningGoals: z.array(z.string()).min(1, "Select at least one learning goal"),
  preferredPace: z.enum(["slow", "moderate", "fast"], {
    errorMap: () => ({ message: "Invalid preferred pace" }),
  }),
  stellarAddress: z.string().optional().superRefine((val, ctx) => {
    if (val) {
      const res = stellarAddress(val);
      if (!res.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.error,
        });
      }
    }
  }),
});
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export const courseCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"], {
    errorMap: () => ({ message: "Difficulty must be beginner, intermediate, or advanced" }),
  }),
  category: z.string().min(2, "Category is required"),
  estimatedHours: z.number().positive("Estimated hours must be a positive number"),
  rewardTokenAmount: z.number().nonnegative("Reward amount cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL").optional(),
});
export type CourseCreate = z.infer<typeof courseCreateSchema>;

export const quizSubmitSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  userId: z.string().min(1, "User ID is required"),
  answers: z.array(
    z.object({
      questionId: z.string().min(1, "Question ID is required"),
      selectedOptionId: z.string().min(1, "Selected option is required"),
    })
  ).min(1, "At least one answer must be provided"),
  timeTakenSeconds: z.number().nonnegative("Time taken cannot be negative").optional(),
});
export type QuizSubmit = z.infer<typeof quizSubmitSchema>;

export const rewardClaimSchema = z.object({
  id: z.string().min(1, "Claim ID is required"),
  txHash: z.string().min(1, "Transaction hash is required"),
  amount: z.string().min(1, "Amount is required"),
  tokenCode: z.string().min(1, "Token code is required"),
  decimals: z.number().nonnegative().optional(),
  claimedAt: z.string().datetime("Must be a valid ISO date string"),
  status: z.enum(["pending", "confirmed", "failed"]),
  courseTitle: z.string().optional(),
});
export type RewardClaimType = z.infer<typeof rewardClaimSchema>;

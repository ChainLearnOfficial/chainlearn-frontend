import { StrKey } from "@stellar/stellar-sdk";

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

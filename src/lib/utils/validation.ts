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

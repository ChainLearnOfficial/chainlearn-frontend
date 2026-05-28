export interface WalletInfo {
  publicKey: string;
  network: "testnet" | "public";
  isConnected: boolean;
}

export interface TokenBalance {
  tokenCode: string;
  tokenIssuer?: string;
  balance: string;
  decimals: number;
}

export interface RewardClaim {
  id: string;
  txHash: string;
  amount: string;
  tokenCode: string;
  claimedAt: string;
  status: "pending" | "confirmed" | "failed";
  courseTitle?: string;
}

export interface CredentialNFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  metadata: CredentialMetadata;
}

export interface CredentialMetadata {
  learnerAddress: string;
  courseTitle: string;
  completionDate: string;
  score?: number;
  skills: string[];
  issuerAddress: string;
  verificationUrl: string;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  ledger?: number;
  error?: string;
}

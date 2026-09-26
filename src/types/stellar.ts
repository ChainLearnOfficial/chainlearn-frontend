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

export interface AssetBalance {
  assetCode: string;
  assetIssuer?: string;
  balance: string;
  assetType: "native" | "credit_alphanum4" | "credit_alphanum12";
}

export interface RewardClaim {
  id: string;
  txHash: string;
  amount: string;
  tokenCode: string;
  decimals?: number;
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
  txHash?: string;
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

export interface ContractCallResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  txHash?: string;
  gasUsed?: number;
}

export interface NetworkConfig {
  network: "testnet" | "public";
  horizonUrl: string;
  networkPassphrase: string;
}

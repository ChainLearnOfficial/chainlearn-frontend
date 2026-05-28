export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  displayName: string;
  background: string;
  learningGoals: string[];
  preferredPace: "slow" | "moderate" | "fast";
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

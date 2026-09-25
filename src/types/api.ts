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
  nextCursor?: string | null;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export interface RequestConfig extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
  retries?: number;
}

export interface ResponseInterceptor {
  onSuccess?: <T>(response: T) => T | Promise<T>;
  onError?: (error: unknown) => never | Promise<never>;
}

export interface UserSession {
  id: string;
  device: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  lastActive: string;
  createdAt: string;
  isCurrent?: boolean;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
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

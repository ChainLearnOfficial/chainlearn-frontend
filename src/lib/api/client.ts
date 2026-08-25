import { ApiError, ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/auth-store";
import { useErrorStore } from "@/store/error-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const REQUEST_TIMEOUT_MS = 15000;
const RETRY_BASE_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(jwt?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (jwt) {
      headers["Authorization"] = `Bearer ${jwt}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().disconnect();
      }
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorBody.message || response.statusText,
        errorBody.code
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }

  private isTransientError(error: Error): boolean {
    if (error instanceof ApiError) {
      return error.code === "TIMEOUT" || error.code === "NETWORK_ERROR";
    }
    return false;
  }

  /**
   * Runs fetch with a request timeout and retries on transient network
   * failures (connection drop, DNS failure, timeout). Retries are skipped
   * for POST since a failed connection doesn't guarantee the server never
   * received the request, and POST is generally not idempotent.
   */
  private async fetchWithRetry(
    url: string,
    init: RequestInit,
    retries: number
  ): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        return response;
      } catch (error) {
        const isTimeout = error instanceof DOMException && error.name === "AbortError";
        const isNetworkError = error instanceof TypeError;

        if (!isTimeout && !isNetworkError) {
          throw error;
        }
        if (attempt >= retries) {
          throw isTimeout
            ? new ApiError(0, "Request timed out", "TIMEOUT")
            : new ApiError(
                0,
                "Unable to reach the server. Check your connection.",
                "NETWORK_ERROR"
              );
        }
        await delay(RETRY_BASE_DELAY_MS * 2 ** attempt);
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  private handleApiError(error: ApiError): void {
    const isTransient = this.isTransientError(error);
    useErrorStore.getState().setError(error, isTransient);
  }

  async get<T>(path: string, jwt?: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${path}`,
        { method: "GET", headers: this.getHeaders(jwt) },
        2
      );
      return this.handleResponse<ApiResponse<T>>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        this.handleApiError(error);
      }
      throw error;
    }
  }

  async post<T>(
    path: string,
    body: unknown,
    jwt?: string
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${path}`,
        {
          method: "POST",
          headers: this.getHeaders(jwt),
          body: JSON.stringify(body),
        },
        0
      );
      return this.handleResponse<ApiResponse<T>>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        this.handleApiError(error);
      }
      throw error;
    }
  }

  async put<T>(
    path: string,
    body: unknown,
    jwt?: string
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${path}`,
        {
          method: "PUT",
          headers: this.getHeaders(jwt),
          body: JSON.stringify(body),
        },
        2
      );
      return this.handleResponse<ApiResponse<T>>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        this.handleApiError(error);
      }
      throw error;
    }
  }

  async delete<T>(path: string, jwt?: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${path}`,
        { method: "DELETE", headers: this.getHeaders(jwt) },
        2
      );
      return this.handleResponse<ApiResponse<T>>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        this.handleApiError(error);
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient(BASE_URL);

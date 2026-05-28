import { ApiError, ApiResponse } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
      const errorBody = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorBody.message || response.statusText,
        code: errorBody.code,
      } as ApiError;
    }
    return response.json();
  }

  async get<T>(path: string, jwt?: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: this.getHeaders(jwt),
    });
    return this.handleResponse<ApiResponse<T>>(response);
  }

  async post<T>(
    path: string,
    body: unknown,
    jwt?: string
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.getHeaders(jwt),
      body: JSON.stringify(body),
    });
    return this.handleResponse<ApiResponse<T>>(response);
  }

  async put<T>(
    path: string,
    body: unknown,
    jwt?: string
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: this.getHeaders(jwt),
      body: JSON.stringify(body),
    });
    return this.handleResponse<ApiResponse<T>>(response);
  }

  async delete<T>(path: string, jwt?: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(jwt),
    });
    return this.handleResponse<ApiResponse<T>>(response);
  }
}

export const apiClient = new ApiClient(BASE_URL);

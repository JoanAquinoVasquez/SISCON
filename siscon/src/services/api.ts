// src/services/api.ts
import { API_URL } from "../config/api";

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string> {
    const token = localStorage.getItem("auth_token");
    if (!token) throw new Error("No authenticated user");
    return token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...((options.headers as Record<string, string>) || {}),
    };

    // Only set Content-Type if it's not already set and we're not sending FormData
    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Error desconocido" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(
    endpoint: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
    },
  ): Promise<T> {
    let url = endpoint;
    if (options?.params) {
      // Filter out undefined/null values
      const cleanParams = Object.entries(options.params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {});

      const queryString = new URLSearchParams(cleanParams).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.request<T>(url, { headers: options?.headers });
  }

  async post<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  }

  async patch<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const api = new ApiService();

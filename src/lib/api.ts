import {
  ApiError,
  CreateTaskRequest,
  LoginRequest,
  PagedTasksResponse,
  TaskFilters,
  TaskResponse,
  TokenResponse,
  UpdateTaskRequest,
} from "@/types/api";
import { logger } from "./logger";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
      const expiresAt = localStorage.getItem("auth_token_expires_at");
      this.tokenExpiresAt = expiresAt ? parseInt(expiresAt, 10) : null;
    }
  }

  setToken(token: string | null, expiresInSeconds?: number) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);

        if (expiresInSeconds) {
          const expiresAt = Date.now() + expiresInSeconds * 1000;
          this.tokenExpiresAt = expiresAt;
          localStorage.setItem("auth_token_expires_at", expiresAt.toString());
        }
      } else {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_token_expires_at");
        this.tokenExpiresAt = null;
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getTokenExpiresAt(): number | null {
    return this.tokenExpiresAt;
  }

  isTokenExpired(): boolean {
    if (!this.token) {
      return true;
    }
    if (!this.tokenExpiresAt) {
      return false;
    }
    return Date.now() >= this.tokenExpiresAt;
  }

  isTokenExpiringSoon(thresholdSeconds: number = 300): boolean {
    if (!this.token || !this.tokenExpiresAt) {
      return false;
    }
    const thresholdMs = thresholdSeconds * 1000;
    return Date.now() >= this.tokenExpiresAt - thresholdMs;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Check if token is expired before making request
    if (this.token && this.isTokenExpired()) {
      logger.auth("Token expired before request, redirecting to login");
      this.setToken(null);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("session_expired", "true");
        window.location.href = "/login";
      }
      throw {
        message: "Your session has expired. Please login again.",
        status: 401,
      };
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const method = options.method || "GET";
    logger.apiRequest(method, url);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      logger.apiResponse(method, url, response.status, {
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
      });

      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get("content-type");
      const isJson =
        contentType?.includes("application/json") ||
        contentType?.includes("application/problem+json");

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          this.setToken(null); // Clear token and cookie

          // Only redirect if NOT on login page (failed auth on other pages)
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            // Store session expired flag
            sessionStorage.setItem("session_expired", "true");
            // Redirect to login
            window.location.href = "/login";
          }
        }

        const errorBody = isJson ? await response.json() : await response.text();
        let errorMessage: string;

        if (typeof errorBody === "string") {
          errorMessage = errorBody;
        } else if (errorBody.detail) {
          errorMessage = errorBody.detail;
        } else if (errorBody.message) {
          errorMessage = errorBody.message;
        } else if (errorBody.title) {
          errorMessage = errorBody.title;
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw apiError;
      }

      if (isJson) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (error.message.includes("NetworkError")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("CORS")) {
          errorMessage = "Service temporarily unavailable. Please try again later.";
        } else {
          errorMessage = "An error occurred. Please try again.";
        }
      }

      const apiError: ApiError = {
        message: errorMessage,
        status: 0,
      };
      throw apiError;
    }
  }

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    logger.auth("Login attempt", { username: credentials.username });
    const response = await this.request<TokenResponse>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );
    logger.auth("Login successful", {
      hasToken: !!response.token,
      expiresIn: response.expiresInSeconds,
    });
    if (response.token) {
      this.setToken(response.token, response.expiresInSeconds);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>("/api/v1/auth/logout", {
        method: "POST",
      });
    } catch (e) {
      logger.warn("Logout request failed, clearing client state anyway", { error: e });
    }

    this.setToken(null);
  }

  // Task API
  async getTasks(filters?: TaskFilters): Promise<PagedTasksResponse> {
    const params = new URLSearchParams();

    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.size) {
      params.append("size", filters.size.toString());
    }
    if (filters?.q) {
      params.append("q", filters.q);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.sort) {
      params.append("sort", filters.sort);
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/v1/tasks?${queryString}`
      : "/api/v1/tasks";

    return this.request<PagedTasksResponse>(endpoint);
  }

  async getTask(id: string): Promise<TaskResponse> {
    return this.request<TaskResponse>(`/api/v1/tasks/${id}`);
  }

  async createTask(task: CreateTaskRequest): Promise<void> {
    return this.request<void>("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: UpdateTaskRequest): Promise<void> {
    return this.request<void>(`/api/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`/api/v1/tasks/${id}`, {
      method: "DELETE",
    });
  }
}

// Export class for testing
export { ApiClient };

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

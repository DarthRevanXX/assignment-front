/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiClient } from "./api";
import { TaskStatus, SortOrder } from "@/types/api";
import type { LoginRequest } from "@/types/api";

describe("ApiClient", () => {
  let apiClient: ApiClient;
  const baseUrl = "http://localhost:8080";

  beforeEach(() => {
    // Create a new instance for each test
    apiClient = new ApiClient(baseUrl);
    // Clear mocks
    vi.clearAllMocks();
    // Clear storage
    localStorage.clear();
    document.cookie = "";
  });

  describe("Token Management", () => {
    it("should set and get token", () => {
      const token = "test-token-123";
      apiClient.setToken(token, 3600);

      expect(apiClient.getToken()).toBe(token);
      expect(localStorage.getItem("auth_token")).toBe(token);
      expect(apiClient.getTokenExpiresAt()).toBeGreaterThan(Date.now());
    });

    it("should NOT set client-side cookie (backend sets HTTP-only cookie)", () => {
      const token = "test-token-456";
      // Clear any existing cookies
      document.cookie = "";

      apiClient.setToken(token, 3600);

      // Verify token is in localStorage but NOT in client-accessible cookie
      expect(localStorage.getItem("auth_token")).toBe(token);
      // The backend sets an HTTP-only cookie which is more secure
      // We should NOT see it in document.cookie (because it's HTTP-only)
      expect(document.cookie).not.toContain("auth_token=test-token-456");
    });

    it("should clear token from localStorage when setting null", () => {
      const token = "test-token-789";
      apiClient.setToken(token, 3600);
      expect(apiClient.getToken()).toBe(token);

      apiClient.setToken(null);
      expect(apiClient.getToken()).toBeNull();
      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(localStorage.getItem("auth_token_expires_at")).toBeNull();
      // Note: HTTP-only cookie is cleared by backend's logout endpoint
    });

    it("should load token from localStorage on initialization", () => {
      localStorage.setItem("auth_token", "stored-token");
      const newClient = new ApiClient(baseUrl);

      expect(newClient.getToken()).toBe("stored-token");
    });

    it("should detect expired token", () => {
      const token = "expired-token";
      // Set token with expiration in the past
      const pastTime = Date.now() - 1000;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_token_expires_at", pastTime.toString());

      const newClient = new ApiClient(baseUrl);
      expect(newClient.isTokenExpired()).toBe(true);
    });

    it("should detect token expiring soon", () => {
      const token = "expiring-token";
      apiClient.setToken(token, 200); // Expires in 200 seconds

      // Should be expiring soon (threshold default is 300 seconds)
      expect(apiClient.isTokenExpiringSoon(300)).toBe(true);
      expect(apiClient.isTokenExpiringSoon(100)).toBe(false);
    });
  });

  describe("Login", () => {
    it("should login successfully and store token", async () => {
      const credentials: LoginRequest = {
        username: "testuser",
        password: "testpass",
      };
      const mockResponse = {
        token: "jwt-token-xyz",
        expiresInSeconds: 3600,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await apiClient.login(credentials);

      expect(response.token).toBe("jwt-token-xyz");
      expect(apiClient.getToken()).toBe("jwt-token-xyz");
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/auth/login`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(credentials),
        })
      );
    });

    it("should handle login failure", async () => {
      const credentials: LoginRequest = {
        username: "wrong",
        password: "wrong",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid credentials" }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      await expect(apiClient.login(credentials)).rejects.toMatchObject({
        message: "Invalid credentials",
        status: 401,
      });
    });
  });

  describe("Logout", () => {
    it("should logout and clear token", async () => {
      apiClient.setToken("test-token");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      await apiClient.logout();

      expect(apiClient.getToken()).toBeNull();
      expect(localStorage.getItem("auth_token")).toBeNull();
    });

    it("should clear token even if logout request fails", async () => {
      apiClient.setToken("test-token");

      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await apiClient.logout();

      expect(apiClient.getToken()).toBeNull();
    });
  });

  describe("Task Operations", () => {
    beforeEach(() => {
      apiClient.setToken("valid-token");
    });

    it("should get tasks with filters", async () => {
      const mockTasks = {
        items: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            title: "Test Task",
            description: "Test Description",
            status: TaskStatus.PENDING,
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
          },
        ],
        total: 1,
        page: 1,
        size: 20,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTasks,
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await apiClient.getTasks({
        page: 1,
        size: 20,
        status: TaskStatus.PENDING,
        sort: SortOrder.CREATED_DESC,
      });

      expect(response.items).toHaveLength(1);
      expect(response.items[0].title).toBe("Test Task");
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/tasks?"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer valid-token",
          }),
        })
      );
    });

    it("should create a task", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      await apiClient.createTask({
        title: "New Task",
        description: "New Description",
      });

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/tasks`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            title: "New Task",
            description: "New Description",
          }),
        })
      );
    });

    it("should update a task", async () => {
      const taskId = "123e4567-e89b-12d3-a456-426614174000";

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      await apiClient.updateTask(taskId, {
        title: "Updated Task",
        status: "IN_PROGRESS",
      });

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/tasks/${taskId}`,
        expect.objectContaining({
          method: "PUT",
        })
      );
    });

    it("should delete a task", async () => {
      const taskId = "123e4567-e89b-12d3-a456-426614174000";

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      await apiClient.deleteTask(taskId);

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/tasks/${taskId}`,
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("Proactive Token Expiration", () => {
    it("should reject requests when token is expired", async () => {
      // Set expired token
      const token = "expired-token";
      const pastTime = Date.now() - 1000;
      apiClient.setToken(token, -1); // Expired immediately
      localStorage.setItem("auth_token_expires_at", pastTime.toString());

      // Mock window.location
      delete (window as any).location;
      window.location = { href: "" } as any;

      await expect(apiClient.getTasks()).rejects.toMatchObject({
        message: "Your session has expired. Please login again.",
        status: 401,
      });

      expect(apiClient.getToken()).toBeNull();
      expect(sessionStorage.getItem("session_expired")).toBe("true");
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      apiClient.setToken("valid-token", 3600);
    });

    it("should handle 401 and clear token", async () => {
      // Mock window.location (not on login page, so should redirect)
      delete (window as any).location;
      window.location = { href: "", pathname: "/tasks" } as any;

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      try {
        await apiClient.getTasks();
      } catch (error) {
        // Expected to throw
      }

      expect(apiClient.getToken()).toBeNull();
      expect(sessionStorage.getItem("session_expired")).toBe("true");
    });

    it("should handle network errors", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

      await expect(apiClient.getTasks()).rejects.toMatchObject({
        message: expect.stringContaining("Unable to connect to the server"),
        status: 0,
      });
    });

    it("should handle JSON parse errors", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
        text: async () => "Internal Server Error",
        headers: new Headers({ "content-type": "text/plain" }),
      });

      await expect(apiClient.getTasks()).rejects.toMatchObject({
        message: "Internal Server Error",
        status: 500,
      });
    });
  });

  describe("Authorization Header", () => {
    it("should include Authorization header when token is set", async () => {
      apiClient.setToken("my-jwt-token");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ items: [], total: 0, page: 1, size: 20 }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      await apiClient.getTasks();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer my-jwt-token",
          }),
        })
      );
    });

    it("should not include Authorization header when no token", async () => {
      // Ensure no token is set
      apiClient.setToken(null);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ token: "new-token" }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      await apiClient.login({ username: "test", password: "test" });

      const firstCall = (fetch as any).mock.calls[0][1];
      expect(firstCall.headers.Authorization).toBeUndefined();
    });
  });
});

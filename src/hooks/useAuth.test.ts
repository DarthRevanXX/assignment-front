import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { apiClient } from "@/lib/api";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Initial State", () => {
    it("should initialize with authenticated state when token exists", async () => {
      vi.mocked(apiClient.getToken).mockReturnValue("existing-token");

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should initialize with unauthenticated state when no token", async () => {
      vi.mocked(apiClient.getToken).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("Login", () => {
    it("should login successfully", async () => {
      vi.mocked(apiClient.getToken).mockReturnValue(null);
      vi.mocked(apiClient.login).mockResolvedValue({
        token: "new-token",
        expiresInSeconds: 3600,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const loginResult = await result.current.login({
        username: "testuser",
        password: "testpass",
      });

      expect(loginResult.success).toBe(true);
      expect(apiClient.login).toHaveBeenCalledWith({
        username: "testuser",
        password: "testpass",
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it("should handle login failure", async () => {
      vi.mocked(apiClient.getToken).mockReturnValue(null);
      vi.mocked(apiClient.login).mockRejectedValue({
        message: "Invalid credentials",
        status: 401,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const loginResult = await result.current.login({
        username: "wrong",
        password: "wrong",
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe("Invalid credentials");
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should handle login with generic error message", async () => {
      vi.mocked(apiClient.getToken).mockReturnValue(null);
      vi.mocked(apiClient.login).mockRejectedValue({
        status: 500,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const loginResult = await result.current.login({
        username: "test",
        password: "test",
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe("Login failed");
    });
  });

  describe("Logout", () => {
    it("should logout successfully", async () => {
      vi.mocked(apiClient.getToken).mockReturnValue("existing-token");
      vi.mocked(apiClient.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);

      await result.current.logout();

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(apiClient.logout).toHaveBeenCalled();
    });

    it("should handle logout errors gracefully", async () => {
      vi.mocked(apiClient.getToken).mockReturnValue("existing-token");
      vi.mocked(apiClient.logout).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not throw error
      await expect(result.current.logout()).resolves.not.toThrow();

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe("Router Integration", () => {
    it("should call login and update state", async () => {
      vi.mocked(apiClient.getToken).mockReturnValue(null);
      vi.mocked(apiClient.login).mockResolvedValue({
        token: "new-token",
        expiresInSeconds: 3600,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const loginResult = await result.current.login({
        username: "testuser",
        password: "testpass",
      });

      expect(loginResult.success).toBe(true);

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it("should call logout and update state", async () => {
      vi.mocked(apiClient.getToken).mockReturnValue("token");
      vi.mocked(apiClient.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);

      await result.current.logout();

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });
});

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api";
import type { ApiError, LoginRequest } from "@/types/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!apiClient.getToken();
  });
  const isLoading = false;
  const router = useRouter();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await apiClient.login(credentials);
        setIsAuthenticated(true);
        router.replace("/tasks");
        return { success: true };
      } catch (error) {
        const apiError = error as ApiError;
        return {
          success: false,
          error: apiError.message || "Login failed",
        };
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch {
      // Ignore errors
    }
    setIsAuthenticated(false);
    router.replace("/login");
  }, [router]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}

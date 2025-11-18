"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

interface UseTokenExpirationOptions {
  /**
   * Show warning this many seconds before token expires
   * @default 300 (5 minutes)
   */
  warningThresholdSeconds?: number;
  /**
   * Check token expiration every N milliseconds
   * @default 60000 (1 minute)
   */
  checkIntervalMs?: number;
  /**
   * Enable automatic checks
   * @default true
   */
  enabled?: boolean;
}

export function useTokenExpiration(options: UseTokenExpirationOptions = {}) {
  const {
    warningThresholdSeconds = 300, // 5 minutes
    checkIntervalMs = 60000, // 1 minute
    enabled = true,
  } = options;

  const router = useRouter();
  const warningShownRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const checkTokenExpiration = () => {
      const token = apiClient.getToken();
      const expiresAt = apiClient.getTokenExpiresAt();

      // No token, nothing to check
      if (!token || !expiresAt) {
        warningShownRef.current = false;
        return;
      }

      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const timeUntilExpirySeconds = Math.floor(timeUntilExpiry / 1000);

      // Token already expired
      if (timeUntilExpiry <= 0) {
        logger.auth("Token expired, logging out");
        apiClient.setToken(null);
        sessionStorage.setItem("session_expired", "true");
        router.replace("/login");
        return;
      }

      // Token expiring soon, show warning once
      if (
        timeUntilExpirySeconds <= warningThresholdSeconds &&
        !warningShownRef.current
      ) {
        const minutes = Math.ceil(timeUntilExpirySeconds / 60);
        toast.warning("Session Expiring Soon", {
          description: `Your session will expire in ${minutes} minute${minutes > 1 ? "s" : ""}. Please save your work.`,
          duration: 10000,
        });
        warningShownRef.current = true;
      }

      // Reset warning flag if we're well before expiration
      if (timeUntilExpirySeconds > warningThresholdSeconds + 60) {
        warningShownRef.current = false;
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Set up interval
    intervalRef.current = setInterval(checkTokenExpiration, checkIntervalMs);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    enabled,
    warningThresholdSeconds,
    checkIntervalMs,
    router,
  ]);

  return {
    isTokenExpired: apiClient.isTokenExpired.bind(apiClient),
    isTokenExpiringSoon: apiClient.isTokenExpiringSoon.bind(apiClient),
    getTokenExpiresAt: apiClient.getTokenExpiresAt.bind(apiClient),
  };
}

/**
 * Production-ready logging utility
 *
 * In development: Logs to console
 * In production: Sends to external logging service (Sentry, LogRocket, etc.)
 */

import { captureException, captureMessage } from "./monitoring";

type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isProduction = process.env.NODE_ENV === "production";
  }

  /**
   * Debug-level logging (only in development)
   */
  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  }

  /**
   * Info-level logging
   */
  info(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || "");
    }
    // In production, you could send to an external service
    this.logToService("info", message, context);
  }

  /**
   * Warning-level logging
   */
  warn(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || "");
    }
    // In production, send warnings to monitoring service
    this.logToService("warn", message, context);
  }

  /**
   * Error-level logging
   */
  error(message: string, error?: Error, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error || "", context || "");
    }
    // In production, send errors to monitoring service
    this.logToService("error", message, context, error);

    // Also capture in Sentry/LogRocket
    if (this.isProduction && error) {
      captureException(error, context);
    }
  }

  /**
   * API request logging
   */
  apiRequest(method: string, url: string, context?: Record<string, unknown>) {
    this.debug(`API Request: ${method} ${url}`, context);
  }

  /**
   * API response logging
   */
  apiResponse(
    method: string,
    url: string,
    status: number,
    context?: Record<string, unknown>
  ) {
    if (status >= 400) {
      this.warn(`API Error: ${method} ${url} - ${status}`, context);
    } else {
      this.debug(`API Response: ${method} ${url} - ${status}`, context);
    }
  }

  /**
   * Authentication event logging
   */
  auth(event: string, context?: Record<string, unknown>) {
    this.info(`Auth: ${event}`, context);
  }

  /**
   * Send logs to external service
   * Integrates with Sentry, LogRocket, DataDog, etc.
   */
  private logToService(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ) {
    if (!this.isProduction) return;

    // Send to monitoring service
    if (level === "error" && error) {
      captureException(error, context);
    } else if (level === "warn" || level === "error") {
      captureMessage(message, level === "error" ? "error" : "warning", context);
    } else if (level === "info") {
      captureMessage(message, "info", context);
    }

    // Additional integrations can be added here:
    // - DataDog: DD_LOGS.logger.log(message, context, level)
    // - Custom API: fetch('/api/logs', { method: 'POST', body: JSON.stringify(...) })
  }
}

// Export singleton instance
export const logger = new Logger();

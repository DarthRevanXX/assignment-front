/**
 * External monitoring service integration
 *
 * This module provides integration points for external monitoring services
 * like Sentry, LogRocket, DataDog, etc.
 *
 * To enable in production:
 * 1. Install the monitoring package: npm install @sentry/nextjs
 * 2. Add environment variables (SENTRY_DSN, etc.)
 * 3. Uncomment the initialization code below
 * 4. Create sentry.client.config.ts and sentry.server.config.ts
 */

interface ErrorContext {
  componentStack?: string;
  errorBoundary?: boolean;
  [key: string]: unknown;
}

/**
 * Initialize monitoring services
 * Call this once at app startup
 */
export function initMonitoring() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  // Sentry initialization (example)
  // Uncomment and configure when ready to use
  /*
  import * as Sentry from "@sentry/nextjs";

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,

    // Set sampling rate for profiling
    profilesSampleRate: 1.0,

    // Capture session replays for errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Filter out PII or sensitive info
      return event;
    },

    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
  */

  // LogRocket initialization (example)
  /*
  import LogRocket from 'logrocket';

  LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID);

  // Identify user (after authentication)
  // LogRocket.identify('user-id', {
  //   name: 'User Name',
  //   email: 'user@example.com',
  // });
  */
}

/**
 * Capture an exception
 */
export function captureException(
  error: Error,
  context?: ErrorContext
): void {
  if (process.env.NODE_ENV === "production") {
    // Sentry example:
    // Sentry.captureException(error, { contexts: { react: context } });

    // LogRocket example:
    // LogRocket.captureException(error, { extra: context });

    // For now, just log to console in development
    console.error("[Monitoring] Exception:", error, context);
  }
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "production") {
    // Sentry example:
    // Sentry.captureMessage(message, { level, extra: context });

    console.log(`[Monitoring] ${level.toUpperCase()}:`, message, context);
  }
}

/**
 * Set user context for monitoring
 */
export function setUserContext(user: {
  id: string;
  username?: string;
  email?: string;
}): void {
  if (process.env.NODE_ENV === "production") {
    // Sentry example:
    // Sentry.setUser({ id: user.id, username: user.username, email: user.email });

    // LogRocket example:
    // LogRocket.identify(user.id, { name: user.username, email: user.email });

    console.log("[Monitoring] User context set:", user.id);
  }
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  if (process.env.NODE_ENV === "production") {
    // Sentry example:
    // Sentry.setUser(null);

    console.log("[Monitoring] User context cleared");
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "production") {
    // Sentry example:
    // Sentry.addBreadcrumb({ message, category, data, level: 'info' });

    console.log(`[Monitoring] Breadcrumb: ${category} - ${message}`, data);
  }
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  if (process.env.NODE_ENV === "production") {
    // Sentry example:
    // return Sentry.startTransaction({ name, op });

    return {
      finish: () => {
        console.log(`[Monitoring] Transaction finished: ${name} (${op})`);
      },
    };
  }

  return { finish: () => {} };
}

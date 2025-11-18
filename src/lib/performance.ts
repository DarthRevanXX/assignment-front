/**
 * Performance utilities for optimizing app performance
 */

/**
 * Request idle callback with fallback
 * Runs code when browser is idle to not block main thread
 */
export function requestIdleCallback(callback: () => void): void {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, 1);
  }
}

/**
 * Debounce function to limit how often a function is called
 * Useful for search inputs, scroll handlers, etc.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function isn't called more than once in a time period
 * Useful for scroll handlers, resize handlers, etc.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Prefetch a route for faster navigation
 */
export function prefetchRoute(href: string): void {
  if (typeof window === "undefined") return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Check if device prefers reduced motion
 * Useful for disabling animations for accessibility
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get connection type for adaptive loading
 */
export function getConnectionType(): string {
  if (typeof window === "undefined") return "unknown";

  const connection =
    (navigator as Navigator & { connection?: { effectiveType?: string } })
      .connection;

  return connection?.effectiveType || "unknown";
}

/**
 * Check if device is on slow connection
 */
export function isSlowConnection(): boolean {
  const type = getConnectionType();
  return type === "slow-2g" || type === "2g";
}

/**
 * Measure performance of a function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`);
    throw error;
  }
}

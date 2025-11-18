/**
 * Web Vitals monitoring for performance tracking
 *
 * Tracks Core Web Vitals:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Loading performance
 * - TTFB (Time to First Byte) - Server response time
 * - INP (Interaction to Next Paint) - Responsiveness
 */

import { logger } from "./logger";

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
}

/**
 * Report Web Vitals to monitoring service
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    logger.debug("Web Vitals", {
      metric: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    // Example integrations:

    // Google Analytics 4
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.(
        "event",
        metric.name,
        {
          value: Math.round(metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
        }
      );
    }

    // Vercel Analytics
    if (typeof window !== "undefined" && "va" in window) {
      (window as Window & { va?: (...args: unknown[]) => void }).va?.(
        "event",
        {
          name: metric.name,
          data: {
            value: Math.round(metric.value),
            rating: metric.rating,
          },
        }
      );
    }

    // Custom API endpoint (example)
    // fetch('/api/vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     metric: metric.name,
    //     value: metric.value,
    //     rating: metric.rating,
    //     page: window.location.pathname,
    //     timestamp: Date.now(),
    //   }),
    // }).catch(console.error);

    // Log to structured logger for external service pickup
    logger.info("Web Vitals", {
      metric: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      page: typeof window !== "undefined" ? window.location.pathname : "",
    });
  }
}

/**
 * Get rating thresholds for each metric
 */
export function getMetricThresholds(name: string): {
  good: number;
  poor: number;
} {
  switch (name) {
    case "CLS":
      return { good: 0.1, poor: 0.25 };
    case "FID":
    case "INP":
      return { good: 100, poor: 300 };
    case "LCP":
      return { good: 2500, poor: 4000 };
    case "FCP":
      return { good: 1800, poor: 3000 };
    case "TTFB":
      return { good: 800, poor: 1800 };
    default:
      return { good: 0, poor: 0 };
  }
}

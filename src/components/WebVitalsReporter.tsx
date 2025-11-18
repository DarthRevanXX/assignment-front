"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { reportWebVitals } from "@/lib/web-vitals";

/**
 * Client component that reports Web Vitals metrics
 * Should be included once in the root layout
 * Optimized to not block rendering
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Defer reporting to not block main thread
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => {
        reportWebVitals({
          id: metric.id,
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          navigationType: metric.navigationType,
        });
      });
    } else {
      setTimeout(() => {
        reportWebVitals({
          id: metric.id,
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          navigationType: metric.navigationType,
        });
      }, 0);
    }
  });

  // Report hydration time - deferred
  useEffect(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      requestIdleCallback(() => {
        const hydrationTime = performance.now();
        reportWebVitals({
          id: "hydration",
          name: "Hydration",
          value: hydrationTime,
          rating: hydrationTime < 1000 ? "good" : hydrationTime < 2000 ? "needs-improvement" : "poor",
          delta: hydrationTime,
          navigationType: "navigate",
        });
      });
    }
  }, []);

  return null;
}

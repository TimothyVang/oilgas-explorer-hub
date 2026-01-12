/**
 * Sentry Error Monitoring Configuration
 *
 * This module initializes Sentry for production error tracking.
 * Configure VITE_SENTRY_DSN environment variable to enable.
 *
 * Features:
 * - Automatic error capture from ErrorBoundary
 * - Performance monitoring with tracing
 * - Session replay for debugging
 * - User context tracking (when authenticated)
 *
 * Environment Variables:
 * - VITE_SENTRY_DSN: Your Sentry DSN (required to enable)
 * - VITE_SENTRY_ENVIRONMENT: Environment name (production, staging, development)
 */

import * as Sentry from "@sentry/react";

/**
 * Check if Sentry is configured and enabled
 */
export const isSentryEnabled = (): boolean => {
  return Boolean(import.meta.env.VITE_SENTRY_DSN);
};

/**
 * Initialize Sentry error monitoring
 *
 * Should be called once at application startup (in main.tsx)
 */
export const initSentry = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info("[Sentry] Disabled - VITE_SENTRY_DSN not configured");
    }
    return;
  }

  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT ||
    (import.meta.env.PROD ? "production" : "development");

  Sentry.init({
    dsn,
    environment,

    // Integrations for enhanced error capture
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),
      // Replay for session recording (helpful for debugging)
      Sentry.replayIntegration({
        // Only record on error
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    // Set lower in production to reduce costs, higher in staging for debugging
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session Replay
    // Only capture replays on errors to minimize data storage
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // Filter out specific errors we don't want to track
    beforeSend(event) {
      // Don't send errors in development
      if (import.meta.env.DEV) {
        console.warn("[Sentry] Would have sent error:", event);
        return null;
      }

      // Filter out network/fetch errors that are expected (e.g., offline)
      if (event.exception?.values?.some(
        (e) => e.type === "TypeError" && e.value?.includes("Failed to fetch")
      )) {
        // Don't filter - we want to know about fetch errors
        // But we could filter them here if they become noisy
      }

      return event;
    },

    // Enable debug mode in development
    debug: import.meta.env.DEV,
  });

  if (import.meta.env.DEV) {
    console.info("[Sentry] Initialized in development mode (events will not be sent)");
  }
};

/**
 * Set the current user context in Sentry
 *
 * Call this when a user logs in to associate errors with their session
 */
export const setSentryUser = (user: {
  id: string;
  email?: string;
  role?: string;
} | null): void => {
  if (!isSentryEnabled()) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      // Custom data for context
      role: user.role,
    });
  } else {
    // Clear user on logout
    Sentry.setUser(null);
  }
};

/**
 * Capture an exception manually
 *
 * Use this for errors that are caught and handled but should still be tracked
 */
export const captureException = (
  error: Error,
  context?: Record<string, unknown>
): void => {
  if (!isSentryEnabled()) {
    console.error("[Sentry] Would capture exception:", error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture a message (for logging non-error events)
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>
): void => {
  if (!isSentryEnabled()) {
    console.log(`[Sentry] Would capture message [${level}]:`, message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};

/**
 * Add breadcrumb for context (helps debug error trails)
 */
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb): void => {
  if (!isSentryEnabled()) return;
  Sentry.addBreadcrumb(breadcrumb);
};

/**
 * Set a tag for filtering in Sentry dashboard
 */
export const setTag = (key: string, value: string): void => {
  if (!isSentryEnabled()) return;
  Sentry.setTag(key, value);
};

/**
 * Create a higher-order component that wraps with Sentry error boundary
 * Use this as an alternative to the custom ErrorBoundary for specific components
 */
export const withSentryErrorBoundary = Sentry.withErrorBoundary;

// Export the Sentry ErrorBoundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Export Sentry for advanced use cases
export { Sentry };

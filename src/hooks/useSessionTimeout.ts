import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface SessionTimeoutConfig {
  /** Time in milliseconds before session is considered idle (default: 30 minutes) */
  timeoutDuration?: number;
  /** Time in milliseconds before timeout to show warning (default: 2 minutes) */
  warningDuration?: number;
  /** Activity events to track for resetting timeout */
  activityEvents?: string[];
  /** Callback when session times out */
  onTimeout?: () => void;
  /** Callback when warning should be shown */
  onWarning?: () => void;
  /** Whether to enable the timeout (default: true) */
  enabled?: boolean;
}

const DEFAULT_TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const DEFAULT_WARNING_DURATION = 2 * 60 * 1000; // 2 minutes before timeout
const DEFAULT_ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'focus',
];

export interface SessionTimeoutState {
  /** Whether the session is active */
  isActive: boolean;
  /** Whether the warning is currently showing */
  isWarningVisible: boolean;
  /** Remaining time in milliseconds before timeout */
  remainingTime: number;
  /** Whether the session has timed out */
  isTimedOut: boolean;
}

export interface SessionTimeoutActions {
  /** Manually reset the timeout */
  resetTimeout: () => void;
  /** Extend the session (dismisses warning and resets timeout) */
  extendSession: () => void;
  /** Manually trigger logout */
  logout: () => Promise<void>;
}

export function useSessionTimeout(config: SessionTimeoutConfig = {}): SessionTimeoutState & SessionTimeoutActions {
  const {
    timeoutDuration = DEFAULT_TIMEOUT_DURATION,
    warningDuration = DEFAULT_WARNING_DURATION,
    activityEvents = DEFAULT_ACTIVITY_EVENTS,
    onTimeout,
    onWarning,
    enabled = true,
  } = config;

  const { user, signOut } = useAuth();

  const [isActive, setIsActive] = useState(true);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeoutDuration);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Handle session timeout
  const handleTimeout = useCallback(async () => {
    clearTimers();
    setIsActive(false);
    setIsTimedOut(true);
    setIsWarningVisible(false);
    onTimeout?.();
    await signOut();
  }, [clearTimers, onTimeout, signOut]);

  // Handle warning
  const handleWarning = useCallback(() => {
    setIsWarningVisible(true);
    setRemainingTime(warningDuration);
    onWarning?.();

    // Start countdown
    countdownRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1000;
        return newTime < 0 ? 0 : newTime;
      });
    }, 1000);
  }, [warningDuration, onWarning]);

  // Reset timeout
  const resetTimeout = useCallback(() => {
    if (!enabled || !user) return;

    lastActivityRef.current = Date.now();
    clearTimers();
    setIsActive(true);
    setIsWarningVisible(false);
    setIsTimedOut(false);
    setRemainingTime(timeoutDuration);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      handleWarning();
    }, timeoutDuration - warningDuration);

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeoutDuration);
  }, [enabled, user, clearTimers, timeoutDuration, warningDuration, handleWarning, handleTimeout]);

  // Extend session (used when user clicks "Stay Logged In")
  const extendSession = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  // Logout manually
  const logout = useCallback(async () => {
    clearTimers();
    setIsActive(false);
    setIsTimedOut(false);
    setIsWarningVisible(false);
    await signOut();
  }, [clearTimers, signOut]);

  // Activity event handler
  const handleActivity = useCallback(() => {
    const now = Date.now();
    // Debounce activity tracking to prevent excessive resets
    if (now - lastActivityRef.current > 1000) {
      resetTimeout();
    }
  }, [resetTimeout]);

  // Set up activity listeners
  useEffect(() => {
    if (!enabled || !user) {
      clearTimers();
      return;
    }

    // Initial timeout setup
    resetTimeout();

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimers();
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, user, activityEvents, handleActivity, resetTimeout, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    isActive,
    isWarningVisible,
    remainingTime,
    isTimedOut,
    resetTimeout,
    extendSession,
    logout,
  };
}

/**
 * Format remaining time as MM:SS
 */
export function formatRemainingTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

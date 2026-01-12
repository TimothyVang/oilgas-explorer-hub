import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to track online/offline status
 *
 * Features:
 * - Detects browser online/offline events
 * - Provides callback for status changes
 * - Optional polling for connection verification
 */

export interface OnlineStatusOptions {
  /** Callback when going online */
  onOnline?: () => void;
  /** Callback when going offline */
  onOffline?: () => void;
  /** Enable polling to verify connection (default: false) */
  enablePolling?: boolean;
  /** Polling interval in ms (default: 30000) */
  pollingInterval?: number;
  /** URL to ping for connection verification */
  pingUrl?: string;
}

const DEFAULT_OPTIONS: Required<Omit<OnlineStatusOptions, 'onOnline' | 'onOffline'>> = {
  enablePolling: false,
  pollingInterval: 30000,
  pingUrl: '/api/health', // Will use favicon if this fails
};

export function useOnlineStatus(options: OnlineStatusOptions = {}) {
  const {
    onOnline,
    onOffline,
    enablePolling,
    pollingInterval,
    pingUrl,
  } = { ...DEFAULT_OPTIONS, ...options };

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(
    isOnline ? new Date() : null
  );

  // Handle going online
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastOnlineAt(new Date());
    onOnline?.();
  }, [onOnline]);

  // Handle going offline
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    onOffline?.();
  }, [onOffline]);

  // Poll connection status
  const checkConnection = useCallback(async () => {
    if (!navigator.onLine) {
      handleOffline();
      return false;
    }

    try {
      // Try to fetch a small resource to verify actual connectivity
      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-store',
      });

      if (response.ok) {
        handleOnline();
        return true;
      }
    } catch {
      // Try favicon as fallback
      try {
        const response = await fetch('/favicon.svg', {
          method: 'HEAD',
          cache: 'no-store',
        });
        if (response.ok) {
          handleOnline();
          return true;
        }
      } catch {
        // Both failed, but we still have navigator.onLine
        // Don't mark offline unless navigator says so
        if (!navigator.onLine) {
          handleOffline();
          return false;
        }
      }
    }

    return isOnline;
  }, [handleOnline, handleOffline, isOnline, pingUrl]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Set up polling if enabled
  useEffect(() => {
    if (!enablePolling) return;

    const intervalId = setInterval(checkConnection, pollingInterval);

    return () => clearInterval(intervalId);
  }, [enablePolling, pollingInterval, checkConnection]);

  return {
    isOnline,
    isOffline: !isOnline,
    lastOnlineAt,
    checkConnection,
  };
}

export default useOnlineStatus;

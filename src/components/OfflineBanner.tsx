import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { toast } from "sonner";

interface OfflineBannerProps {
  className?: string;
  /** Position of the banner */
  position?: "top" | "bottom";
  /** Show dismissible X button */
  dismissible?: boolean;
}

/**
 * Banner that appears when the user goes offline
 *
 * Features:
 * - Automatically shows/hides based on connection status
 * - Animated slide in/out
 * - Manual retry button
 * - Toast notification when back online
 */
export function OfflineBanner({
  className,
  position = "bottom",
  dismissible = false,
}: OfflineBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const { isOffline, isOnline, checkConnection } = useOnlineStatus({
    onOnline: () => {
      toast.success("You're back online!", {
        duration: 3000,
        icon: "🌐",
      });
      setIsDismissed(false); // Reset dismiss when coming back online
    },
    onOffline: () => {
      toast.warning("You're offline. Some features may not work.", {
        duration: 5000,
        icon: "📡",
      });
    },
  });

  // Reset dismissed state when going offline
  useEffect(() => {
    if (isOffline) {
      setIsDismissed(false);
    }
  }, [isOffline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkConnection();
    setIsRetrying(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Don't render if online or dismissed
  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 flex items-center justify-center px-4 py-2",
        "bg-amber-500/95 backdrop-blur-sm text-amber-950",
        "transition-transform duration-300 ease-out",
        position === "top" ? "top-0" : "bottom-0",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-sm font-medium">
        <WifiOff className="w-4 h-4 flex-shrink-0" />
        <span>You're offline. Check your internet connection.</span>

        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
            "bg-amber-950/20 hover:bg-amber-950/30 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Retry connection"
        >
          <RefreshCw
            className={cn("w-3 h-3", isRetrying && "animate-spin")}
          />
          {isRetrying ? "Checking..." : "Retry"}
        </button>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="ml-2 p-1 hover:bg-amber-950/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default OfflineBanner;

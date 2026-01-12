import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  message?: string;
}

/**
 * Animated loading spinner component
 */
export function LoadingSpinner({
  className,
  size = "md",
  message
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4"
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className={cn(
          "border-primary/30 border-t-primary rounded-full animate-spin",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <span className="text-white/60 text-sm">{message}</span>
      )}
    </div>
  );
}

/**
 * Full page loading state
 */
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center">
      <LoadingSpinner size="md" message={message} />
    </div>
  );
}

/**
 * Inline loading spinner (for use within content areas)
 */
export function InlineLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="sm" message={message} />
    </div>
  );
}

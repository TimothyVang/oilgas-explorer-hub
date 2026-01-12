import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * Inline form error message component
 * Displays error message with icon in a consistent style
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-red-400 text-xs mt-1.5",
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Hook for managing form field errors
 */
export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const setFieldError = (field: string, message: string | undefined) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    setErrors,
    setFieldError,
    clearError,
    clearAllErrors,
    hasErrors: Object.keys(errors).length > 0,
  };
}

// Need to import useState for the hook
import { useState } from "react";

/**
 * User-friendly error message mapping
 *
 * Converts technical error messages to helpful, actionable messages for users.
 * Also categorizes errors for better UX (e.g., distinguishing between network issues
 * and authentication problems).
 */

export type ErrorCategory =
  | 'auth'        // Authentication related
  | 'network'     // Network/connectivity issues
  | 'validation'  // Input validation errors
  | 'permission'  // Access denied / forbidden
  | 'notFound'    // Resource not found
  | 'server'      // Server-side errors
  | 'unknown';    // Catch-all

interface FriendlyError {
  message: string;
  category: ErrorCategory;
  actionable?: string; // Optional suggestion for the user
}

/**
 * Map of known technical error patterns to user-friendly messages
 */
const ERROR_MAP: Array<{
  pattern: RegExp | string;
  friendly: FriendlyError;
}> = [
  // Authentication errors
  {
    pattern: /invalid login credentials/i,
    friendly: {
      message: "Invalid email or password. Please try again.",
      category: 'auth',
      actionable: "Double-check your credentials or reset your password.",
    },
  },
  {
    pattern: /email not confirmed/i,
    friendly: {
      message: "Please verify your email before signing in.",
      category: 'auth',
      actionable: "Check your inbox for the verification link.",
    },
  },
  {
    pattern: /already registered/i,
    friendly: {
      message: "An account with this email already exists.",
      category: 'auth',
      actionable: "Try signing in instead, or use a different email.",
    },
  },
  {
    pattern: /user not found/i,
    friendly: {
      message: "No account found with this email.",
      category: 'auth',
      actionable: "Check your email or create a new account.",
    },
  },
  {
    pattern: /password.*too (short|weak)/i,
    friendly: {
      message: "Password is too weak.",
      category: 'validation',
      actionable: "Use at least 6 characters with a mix of letters and numbers.",
    },
  },
  {
    pattern: /token.*expired/i,
    friendly: {
      message: "Your session has expired.",
      category: 'auth',
      actionable: "Please sign in again to continue.",
    },
  },
  {
    pattern: /refresh_token_not_found/i,
    friendly: {
      message: "Your session has expired.",
      category: 'auth',
      actionable: "Please sign in again to continue.",
    },
  },

  // Network errors
  {
    pattern: /fetch|network|ECONNREFUSED|ETIMEDOUT/i,
    friendly: {
      message: "Unable to connect to the server.",
      category: 'network',
      actionable: "Please check your internet connection and try again.",
    },
  },
  {
    pattern: /timeout/i,
    friendly: {
      message: "The request took too long.",
      category: 'network',
      actionable: "Please check your connection and try again.",
    },
  },
  {
    pattern: /offline/i,
    friendly: {
      message: "You appear to be offline.",
      category: 'network',
      actionable: "Please connect to the internet to continue.",
    },
  },

  // Permission errors
  {
    pattern: /permission denied|forbidden|403/i,
    friendly: {
      message: "You don't have permission to perform this action.",
      category: 'permission',
      actionable: "Contact an administrator if you believe this is an error.",
    },
  },
  {
    pattern: /unauthorized|401/i,
    friendly: {
      message: "Please sign in to continue.",
      category: 'permission',
    },
  },

  // Not found errors
  {
    pattern: /not found|404|PGRST116/i,
    friendly: {
      message: "The requested resource was not found.",
      category: 'notFound',
    },
  },

  // Server errors
  {
    pattern: /500|internal server|PGRST000/i,
    friendly: {
      message: "Something went wrong on our end.",
      category: 'server',
      actionable: "Please try again in a few moments.",
    },
  },
  {
    pattern: /503|service unavailable/i,
    friendly: {
      message: "The service is temporarily unavailable.",
      category: 'server',
      actionable: "Please try again in a few moments.",
    },
  },
  {
    pattern: /429|too many requests|rate limit/i,
    friendly: {
      message: "Too many requests. Please slow down.",
      category: 'server',
      actionable: "Wait a moment before trying again.",
    },
  },

  // Validation errors
  {
    pattern: /invalid.*email/i,
    friendly: {
      message: "Please enter a valid email address.",
      category: 'validation',
    },
  },
  {
    pattern: /required|cannot be empty/i,
    friendly: {
      message: "Please fill in all required fields.",
      category: 'validation',
    },
  },

  // Database errors
  {
    pattern: /duplicate|unique constraint|already exists/i,
    friendly: {
      message: "This record already exists.",
      category: 'validation',
      actionable: "Try using different values.",
    },
  },
  {
    pattern: /foreign key|reference/i,
    friendly: {
      message: "This action cannot be completed due to related records.",
      category: 'validation',
    },
  },
];

/**
 * Default error message for unknown errors
 */
const DEFAULT_ERROR: FriendlyError = {
  message: "An unexpected error occurred.",
  category: 'unknown',
  actionable: "Please try again. If the problem persists, contact support.",
};

/**
 * Converts a technical error to a user-friendly message
 *
 * @param error - The error object or message
 * @returns User-friendly error information
 *
 * @example
 * // Using with try/catch
 * try {
 *   await someOperation();
 * } catch (error) {
 *   const friendly = getFriendlyError(error);
 *   toast.error(friendly.message);
 * }
 *
 * @example
 * // Using with Supabase errors
 * const { error } = await supabase.auth.signIn({ email, password });
 * if (error) {
 *   const friendly = getFriendlyError(error);
 *   toast.error(friendly.message);
 * }
 */
export function getFriendlyError(error: unknown): FriendlyError {
  const errorMessage = getErrorMessage(error);

  // Try to match against known patterns
  for (const { pattern, friendly } of ERROR_MAP) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    if (regex.test(errorMessage)) {
      return friendly;
    }
  }

  return DEFAULT_ERROR;
}

/**
 * Extracts error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return '';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  // Supabase/PostgrestError
  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>;

    if (typeof obj.message === 'string') {
      return obj.message;
    }

    if (typeof obj.error_description === 'string') {
      return obj.error_description;
    }

    if (typeof obj.msg === 'string') {
      return obj.msg;
    }

    // Supabase error code
    if (typeof obj.code === 'string') {
      return obj.code;
    }
  }

  return String(error);
}

/**
 * Returns just the user-friendly message string
 * Convenient shorthand for getFriendlyError(error).message
 */
export function getUserMessage(error: unknown): string {
  return getFriendlyError(error).message;
}

/**
 * Returns the full friendly message with actionable hint if available
 */
export function getFullUserMessage(error: unknown): string {
  const friendly = getFriendlyError(error);
  if (friendly.actionable) {
    return `${friendly.message} ${friendly.actionable}`;
  }
  return friendly.message;
}

/**
 * Checks if an error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  return getFriendlyError(error).category === 'network';
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return getFriendlyError(error).category === 'auth';
}

/**
 * Checks if an error should trigger a retry
 */
export function isRetryableError(error: unknown): boolean {
  const category = getFriendlyError(error).category;
  return category === 'network' || category === 'server';
}

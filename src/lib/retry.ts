/**
 * Retry utility with exponential backoff for API calls
 *
 * Features:
 * - Configurable max retries and delays
 * - Exponential backoff with jitter
 * - Retryable error detection
 * - Abort signal support for cancellation
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Whether to add jitter to delays (default: true) */
  jitter?: boolean;
  /** Optional abort signal for cancellation */
  signal?: AbortSignal;
  /** Optional callback for retry events */
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'signal' | 'onRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Determines if an error is retryable
 * - Network errors
 * - Server errors (5xx)
 * - Rate limiting (429)
 * - Timeout errors
 */
function isRetryableError(error: unknown): boolean {
  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Supabase/PostgrestError with retryable status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: number }).status;
    // Retry on server errors, rate limiting, or service unavailable
    if (status && (status >= 500 || status === 429 || status === 408)) {
      return true;
    }
  }

  // Supabase specific error codes
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code;
    // Connection reset, timeout, etc.
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'PGRST000', '57014'];
    if (code && retryableCodes.includes(code)) {
      return true;
    }
  }

  // Message-based detection for network issues
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch failed') ||
      message.includes('aborted')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitter: boolean
): number {
  // Exponential backoff: initialDelay * backoffMultiplier^attempt
  let delay = initialDelay * Math.pow(backoffMultiplier, attempt);

  // Add jitter (0-25% of delay) to prevent thundering herd
  if (jitter) {
    const jitterAmount = delay * 0.25 * Math.random();
    delay = delay + jitterAmount;
  }

  // Cap at max delay
  return Math.min(delay, maxDelay);
}

/**
 * Sleep utility that supports abort signal
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeoutId = setTimeout(resolve, ms);

    const abortHandler = () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', abortHandler, { once: true });
  });
}

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @example
 * // Basic usage
 * const data = await withRetry(async () => {
 *   const { data, error } = await supabase.from('users').select('*');
 *   if (error) throw error;
 *   return data;
 * });
 *
 * @example
 * // With options
 * const data = await withRetry(
 *   () => fetchData(),
 *   {
 *     maxRetries: 5,
 *     initialDelay: 500,
 *     onRetry: (attempt, error) => console.log(`Retry ${attempt}: ${error.message}`)
 *   }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffMultiplier,
    jitter,
  } = { ...DEFAULT_OPTIONS, ...options };

  const { signal, onRetry } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check if aborted before attempting
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if aborted
      if (signal?.aborted || lastError.name === 'AbortError') {
        throw lastError;
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= maxRetries) {
        throw lastError;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw lastError;
      }

      // Calculate delay with backoff
      const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffMultiplier, jitter);

      // Notify about retry
      onRetry?.(attempt + 1, lastError, delay);

      // Wait before retrying
      await sleep(delay, signal);
    }
  }

  // TypeScript: This should never be reached, but satisfies the compiler
  throw lastError!;
}

/**
 * Creates a retryable version of a Supabase query function
 *
 * @example
 * const { data, error } = await retryableQuery(async () =>
 *   supabase.from('users').select('*').eq('id', userId)
 * );
 */
export async function retryableQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data;
    }, options);
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Hook-friendly version that tracks retry state
 */
export interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
}

export function createRetryableExecutor(options: RetryOptions = {}) {
  let state: RetryState = {
    isRetrying: false,
    retryCount: 0,
    lastError: null,
  };

  const execute = async <T>(fn: () => Promise<T>): Promise<T> => {
    state = { isRetrying: false, retryCount: 0, lastError: null };

    return withRetry(fn, {
      ...options,
      onRetry: (attempt, error, delay) => {
        state = {
          isRetrying: true,
          retryCount: attempt,
          lastError: error,
        };
        options.onRetry?.(attempt, error, delay);
      },
    }).finally(() => {
      state.isRetrying = false;
    });
  };

  const getState = () => state;

  return { execute, getState };
}

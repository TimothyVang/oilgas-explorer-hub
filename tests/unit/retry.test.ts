import { describe, it, expect, vi } from 'vitest';
import { withRetry, retryableQuery, createRetryableExecutor } from '@/lib/retry';

describe('Retry Utility', () => {
  describe('withRetry', () => {
    it('succeeds on first attempt without retrying', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on network error and succeeds', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { initialDelay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('retries on 500 server error', async () => {
      const serverError = { status: 500, message: 'Internal Server Error' };
      const fn = vi
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue('success');

      const result = await withRetry(fn, { initialDelay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('retries on rate limiting (429)', async () => {
      const rateLimitError = { status: 429, message: 'Too Many Requests' };
      const fn = vi
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue('success');

      const result = await withRetry(fn, { initialDelay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not retry on client error (4xx except 429)', async () => {
      const clientError = { status: 404, message: 'Not Found' };
      const fn = vi.fn().mockRejectedValue(clientError);

      await expect(withRetry(fn)).rejects.toBeDefined();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('respects maxRetries option', async () => {
      const networkError = new TypeError('fetch failed');
      const fn = vi.fn().mockRejectedValue(networkError);

      await expect(withRetry(fn, { maxRetries: 2, initialDelay: 10 })).rejects.toThrow('fetch failed');

      // Initial + 2 retries = 3 calls
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('calls onRetry callback on each retry', async () => {
      const networkError = new TypeError('fetch failed');
      const fn = vi
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue('success');
      const onRetry = vi.fn();

      await withRetry(fn, { initialDelay: 10, onRetry });

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(1, networkError, expect.any(Number));
      expect(onRetry).toHaveBeenCalledWith(2, networkError, expect.any(Number));
    });

    it('handles connection reset errors', async () => {
      const connectionError = { code: 'ECONNRESET', message: 'Connection reset' };
      const fn = vi
        .fn()
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValue('success');

      const result = await withRetry(fn, { initialDelay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('handles timeout errors', async () => {
      const timeoutError = { code: 'ETIMEDOUT', message: 'Timeout' };
      const fn = vi
        .fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValue('success');

      const result = await withRetry(fn, { initialDelay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('applies exponential backoff', async () => {
      const networkError = new TypeError('fetch failed');
      const fn = vi.fn().mockRejectedValue(networkError);
      const onRetry = vi.fn();

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          initialDelay: 10,
          backoffMultiplier: 2,
          jitter: false,
          onRetry,
        })
      ).rejects.toThrow();

      // Check delays are exponentially increasing
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, expect.any(Error), 10);
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, expect.any(Error), 20);
      expect(onRetry).toHaveBeenNthCalledWith(3, 3, expect.any(Error), 40);
    });

    it('respects maxDelay cap', async () => {
      const networkError = new TypeError('fetch failed');
      const fn = vi.fn().mockRejectedValue(networkError);
      const onRetry = vi.fn();

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          initialDelay: 100,
          maxDelay: 150,
          backoffMultiplier: 2,
          jitter: false,
          onRetry,
        })
      ).rejects.toThrow();

      // All delays should be capped at maxDelay
      onRetry.mock.calls.forEach((call) => {
        expect(call[2]).toBeLessThanOrEqual(150);
      });
    });

    it('respects abort signal', async () => {
      const controller = new AbortController();
      const fn = vi.fn().mockRejectedValue(new TypeError('fetch failed'));

      // Abort immediately
      controller.abort();

      await expect(
        withRetry(fn, {
          signal: controller.signal,
          initialDelay: 10,
        })
      ).rejects.toThrow('Aborted');
    });
  });

  describe('retryableQuery', () => {
    it('returns data on success', async () => {
      const queryFn = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });

      const result = await retryableQuery(queryFn);

      expect(result.data).toEqual([{ id: 1 }]);
      expect(result.error).toBeNull();
    });

    it('returns error after all retries fail', async () => {
      const networkError = { status: 500, message: 'Server Error' };
      const queryFn = vi.fn().mockResolvedValue({ data: null, error: networkError });

      const result = await retryableQuery(queryFn, { maxRetries: 2, initialDelay: 10 });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('retries and succeeds on transient failure', async () => {
      const networkError = { status: 500, message: 'Server Error' };
      const queryFn = vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: networkError })
        .mockResolvedValue({ data: [{ id: 1 }], error: null });

      const result = await retryableQuery(queryFn, { initialDelay: 10 });

      expect(result.data).toEqual([{ id: 1 }]);
      expect(result.error).toBeNull();
    });
  });

  describe('createRetryableExecutor', () => {
    it('executes function successfully', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const { execute, getState } = createRetryableExecutor({ initialDelay: 10 });

      const result = await execute(fn);

      expect(result).toBe('success');
      expect(getState().isRetrying).toBe(false);
    });

    it('tracks retry count on failure', async () => {
      const networkError = new TypeError('fetch failed');
      const fn = vi.fn().mockRejectedValue(networkError);

      const { execute, getState } = createRetryableExecutor({
        maxRetries: 1,
        initialDelay: 10,
      });

      await expect(execute(fn)).rejects.toThrow();

      expect(getState().retryCount).toBeGreaterThan(0);
    });

    it('tracks last error', async () => {
      const networkError = new TypeError('fetch failed');
      const fn = vi.fn().mockRejectedValue(networkError);

      const { execute, getState } = createRetryableExecutor({
        maxRetries: 1,
        initialDelay: 10,
      });

      await expect(execute(fn)).rejects.toThrow();

      expect(getState().lastError).toBeTruthy();
    });
  });
});

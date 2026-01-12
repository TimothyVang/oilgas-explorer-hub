import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/react';

// Mock Sentry
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  setUser: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  setTag: vi.fn(),
  withErrorBoundary: vi.fn((component) => component),
  ErrorBoundary: vi.fn(({ children }) => children),
  browserTracingIntegration: vi.fn(() => ({})),
  replayIntegration: vi.fn(() => ({})),
}));

describe('Sentry Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any cached modules
    vi.resetModules();
  });

  afterEach(() => {
    // Reset environment variables
    vi.unstubAllEnvs();
  });

  describe('isSentryEnabled', () => {
    it('returns false when DSN is not configured', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');
      const { isSentryEnabled } = await import('@/lib/sentry');
      expect(isSentryEnabled()).toBe(false);
    });

    it('returns true when DSN is configured', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@test.ingest.sentry.io/123');
      const { isSentryEnabled } = await import('@/lib/sentry');
      expect(isSentryEnabled()).toBe(true);
    });
  });

  describe('initSentry', () => {
    it('does not initialize when DSN is not set', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');
      const { initSentry } = await import('@/lib/sentry');
      initSentry();
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('initializes when DSN is set', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@test.ingest.sentry.io/123');
      const { initSentry } = await import('@/lib/sentry');
      initSentry();
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@test.ingest.sentry.io/123',
        })
      );
    });
  });

  describe('setSentryUser', () => {
    it('sets user when Sentry is enabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@test.ingest.sentry.io/123');
      const { setSentryUser } = await import('@/lib/sentry');
      
      setSentryUser({
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      });

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      });
    });

    it('clears user on null', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@test.ingest.sentry.io/123');
      const { setSentryUser } = await import('@/lib/sentry');
      
      setSentryUser(null);
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it('does nothing when Sentry is disabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');
      const { setSentryUser } = await import('@/lib/sentry');
      
      setSentryUser({ id: 'user-123' });
      expect(Sentry.setUser).not.toHaveBeenCalled();
    });
  });

  describe('captureException', () => {
    it('captures exception when Sentry is enabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@test.ingest.sentry.io/123');
      const { captureException } = await import('@/lib/sentry');
      
      const error = new Error('Test error');
      captureException(error, { extra: 'context' });

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: { extra: 'context' },
      });
    });

    it('logs to console when Sentry is disabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { captureException } = await import('@/lib/sentry');
      
      const error = new Error('Test error');
      captureException(error);

      expect(Sentry.captureException).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('captureMessage', () => {
    it('captures message when Sentry is enabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@test.ingest.sentry.io/123');
      const { captureMessage } = await import('@/lib/sentry');
      
      captureMessage('Test message', 'warning');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', {
        level: 'warning',
        extra: undefined,
      });
    });

    it('logs to console when Sentry is disabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { captureMessage } = await import('@/lib/sentry');
      
      captureMessage('Test message');

      expect(Sentry.captureMessage).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('addBreadcrumb', () => {
    it('adds breadcrumb when Sentry is enabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@test.ingest.sentry.io/123');
      const { addBreadcrumb } = await import('@/lib/sentry');
      
      addBreadcrumb({
        category: 'test',
        message: 'Test breadcrumb',
        level: 'info',
      });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'test',
        message: 'Test breadcrumb',
        level: 'info',
      });
    });

    it('does nothing when Sentry is disabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');
      const { addBreadcrumb } = await import('@/lib/sentry');
      
      addBreadcrumb({ category: 'test', message: 'Test' });
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('setTag', () => {
    it('sets tag when Sentry is enabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@test.ingest.sentry.io/123');
      const { setTag } = await import('@/lib/sentry');
      
      setTag('testKey', 'testValue');
      expect(Sentry.setTag).toHaveBeenCalledWith('testKey', 'testValue');
    });

    it('does nothing when Sentry is disabled', async () => {
      vi.stubEnv('VITE_SENTRY_DSN', '');
      const { setTag } = await import('@/lib/sentry');
      
      setTag('testKey', 'testValue');
      expect(Sentry.setTag).not.toHaveBeenCalled();
    });
  });
});

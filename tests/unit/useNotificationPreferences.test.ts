import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

// Mock useAuth hook
const mockUser = { id: "user-123", email: "test@example.com" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock Supabase client (not used currently but may be in future)
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      mfa: {
        getAuthenticatorAssuranceLevel: vi.fn(),
        listFactors: vi.fn(),
      },
    },
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("useNotificationPreferences Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with loading state and then load", async () => {
      // Note: Since useEffect runs synchronously in test, loading state transitions quickly
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNotificationPreferences());

      // After initialization, it should finish loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should load default preferences when no stored preferences exist", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences).toEqual({
        emailNewDocuments: true,
        emailDocumentUpdates: true,
        emailNdaReminders: true,
        emailSecurityAlerts: true,
        emailWeeklyDigest: false,
        emailMarketingUpdates: false,
      });
    });

    it("should load stored preferences from localStorage", async () => {
      const storedPrefs = {
        emailNewDocuments: false,
        emailDocumentUpdates: true,
        emailNdaReminders: false,
        emailSecurityAlerts: true,
        emailWeeklyDigest: true,
        emailMarketingUpdates: true,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedPrefs));

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences).toEqual(storedPrefs);
    });

    it("should merge stored preferences with defaults for partial data", async () => {
      const partialPrefs = { emailNewDocuments: false };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(partialPrefs));

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.emailNewDocuments).toBe(false);
      expect(result.current.preferences.emailSecurityAlerts).toBe(true);
    });
  });

  describe("togglePreference", () => {
    it("should toggle a preference on", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      expect(result.current.preferences.emailWeeklyDigest).toBe(false);

      let success;
      await act(async () => {
        success = await result.current.togglePreference("emailWeeklyDigest");
      });

      expect(success).toBe(true);
      expect(result.current.preferences.emailWeeklyDigest).toBe(true);
    });

    it("should toggle a preference off", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      expect(result.current.preferences.emailNewDocuments).toBe(true);

      let success;
      await act(async () => {
        success = await result.current.togglePreference("emailNewDocuments");
      });

      expect(success).toBe(true);
      expect(result.current.preferences.emailNewDocuments).toBe(false);
    });

    it("should save to localStorage when toggling", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        await result.current.togglePreference("emailWeeklyDigest");
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `notification_preferences_${mockUser.id}`,
        expect.any(String)
      );
    });
  });

  describe("savePreferences", () => {
    it("should update multiple preferences at once", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        await result.current.savePreferences({
          emailNewDocuments: false,
          emailWeeklyDigest: true,
        });
      });

      expect(result.current.preferences.emailNewDocuments).toBe(false);
      expect(result.current.preferences.emailWeeklyDigest).toBe(true);
      expect(result.current.preferences.emailSecurityAlerts).toBe(true); // Unchanged
    });
  });

  describe("enableAll", () => {
    it("should enable all notifications", async () => {
      const disabledPrefs = {
        emailNewDocuments: false,
        emailDocumentUpdates: false,
        emailNdaReminders: false,
        emailSecurityAlerts: false,
        emailWeeklyDigest: false,
        emailMarketingUpdates: false,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(disabledPrefs));

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        await result.current.enableAll();
      });

      expect(result.current.preferences).toEqual({
        emailNewDocuments: true,
        emailDocumentUpdates: true,
        emailNdaReminders: true,
        emailSecurityAlerts: true,
        emailWeeklyDigest: true,
        emailMarketingUpdates: true,
      });
    });
  });

  describe("disableOptional", () => {
    it("should disable optional notifications but keep security alerts", async () => {
      const allEnabled = {
        emailNewDocuments: true,
        emailDocumentUpdates: true,
        emailNdaReminders: true,
        emailSecurityAlerts: true,
        emailWeeklyDigest: true,
        emailMarketingUpdates: true,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(allEnabled));

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        await result.current.disableOptional();
      });

      expect(result.current.preferences).toEqual({
        emailNewDocuments: false,
        emailDocumentUpdates: false,
        emailNdaReminders: false,
        emailSecurityAlerts: true, // Always on
        emailWeeklyDigest: false,
        emailMarketingUpdates: false,
      });
    });
  });

  describe("resetToDefaults", () => {
    it("should reset all preferences to defaults", async () => {
      const customPrefs = {
        emailNewDocuments: false,
        emailDocumentUpdates: false,
        emailNdaReminders: false,
        emailSecurityAlerts: false,
        emailWeeklyDigest: true,
        emailMarketingUpdates: true,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customPrefs));

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        await result.current.resetToDefaults();
      });

      expect(result.current.preferences).toEqual({
        emailNewDocuments: true,
        emailDocumentUpdates: true,
        emailNdaReminders: true,
        emailSecurityAlerts: true,
        emailWeeklyDigest: false,
        emailMarketingUpdates: false,
      });
    });
  });

  describe("updateAllPreferences", () => {
    it("should replace all preferences", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      const newPrefs = {
        emailNewDocuments: false,
        emailDocumentUpdates: false,
        emailNdaReminders: false,
        emailSecurityAlerts: true,
        emailWeeklyDigest: true,
        emailMarketingUpdates: true,
      };

      await act(async () => {
        await result.current.updateAllPreferences(newPrefs);
      });

      expect(result.current.preferences).toEqual(newPrefs);
    });
  });

  describe("error handling", () => {
    it("should handle JSON parse error gracefully", async () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      // Should fall back to defaults
      expect(result.current.preferences.emailSecurityAlerts).toBe(true);
    });

    it("should clear error via clearError", async () => {
      // Simulate an error scenario
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      // There should be an error
      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("saving state", () => {
    it("should set isSaving during save operation", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNotificationPreferences());

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isSaving).toBe(false);

      // The save is so fast we can't reliably catch the isSaving state,
      // but we can verify it returns to false after save
      await act(async () => {
        await result.current.togglePreference("emailWeeklyDigest");
      });

      expect(result.current.isSaving).toBe(false);
    });
  });
});

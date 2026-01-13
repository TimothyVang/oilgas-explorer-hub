import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificationPreferences {
  // Email notifications
  emailNewDocuments: boolean;        // New document added to portal
  emailDocumentUpdates: boolean;     // Document version updates
  emailNdaReminders: boolean;        // NDA signing reminders
  emailSecurityAlerts: boolean;      // Login from new device, password changes
  emailWeeklyDigest: boolean;        // Weekly summary of activity
  emailMarketingUpdates: boolean;    // News, announcements, features
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNewDocuments: true,
  emailDocumentUpdates: true,
  emailNdaReminders: true,
  emailSecurityAlerts: true,
  emailWeeklyDigest: false,
  emailMarketingUpdates: false,
};

const STORAGE_KEY = "notification_preferences";

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from localStorage (or could be extended to use Supabase)
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to load from localStorage first
      const storageKey = `${STORAGE_KEY}_${user.id}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (err) {
      console.error("Failed to load notification preferences:", err);
      setError("Failed to load preferences");
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save preferences
  const savePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>): Promise<boolean> => {
    if (!user) {
      setError("You must be logged in to save preferences");
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedPreferences = { ...preferences, ...newPreferences };

      // Save to localStorage
      const storageKey = `${STORAGE_KEY}_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedPreferences));

      // Update local state
      setPreferences(updatedPreferences);

      return true;
    } catch (err) {
      console.error("Failed to save notification preferences:", err);
      setError("Failed to save preferences");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, preferences]);

  // Toggle a single preference
  const togglePreference = useCallback(async (key: keyof NotificationPreferences): Promise<boolean> => {
    return savePreferences({ [key]: !preferences[key] });
  }, [preferences, savePreferences]);

  // Reset to defaults
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    return savePreferences(DEFAULT_PREFERENCES);
  }, [savePreferences]);

  // Update all preferences at once
  const updateAllPreferences = useCallback(async (newPreferences: NotificationPreferences): Promise<boolean> => {
    return savePreferences(newPreferences);
  }, [savePreferences]);

  // Enable all notifications
  const enableAll = useCallback(async (): Promise<boolean> => {
    const allEnabled: NotificationPreferences = {
      emailNewDocuments: true,
      emailDocumentUpdates: true,
      emailNdaReminders: true,
      emailSecurityAlerts: true,
      emailWeeklyDigest: true,
      emailMarketingUpdates: true,
    };
    return savePreferences(allEnabled);
  }, [savePreferences]);

  // Disable all optional notifications (keep security alerts)
  const disableOptional = useCallback(async (): Promise<boolean> => {
    const minimal: NotificationPreferences = {
      emailNewDocuments: false,
      emailDocumentUpdates: false,
      emailNdaReminders: false,
      emailSecurityAlerts: true, // Always keep security alerts on
      emailWeeklyDigest: false,
      emailMarketingUpdates: false,
    };
    return savePreferences(minimal);
  }, [savePreferences]);

  // Load preferences on mount or user change
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    togglePreference,
    savePreferences,
    updateAllPreferences,
    resetToDefaults,
    enableAll,
    disableOptional,
    clearError: () => setError(null),
  };
}

// Preference metadata for UI
export const NOTIFICATION_PREFERENCE_INFO: Record<keyof NotificationPreferences, {
  label: string;
  description: string;
  category: "documents" | "account" | "updates";
  required?: boolean;
}> = {
  emailNewDocuments: {
    label: "New Documents",
    description: "Get notified when new documents are added to your portal",
    category: "documents",
  },
  emailDocumentUpdates: {
    label: "Document Updates",
    description: "Receive updates when documents you have access to are modified",
    category: "documents",
  },
  emailNdaReminders: {
    label: "NDA Reminders",
    description: "Get reminders about pending NDA signatures",
    category: "documents",
  },
  emailSecurityAlerts: {
    label: "Security Alerts",
    description: "Important security notifications (login from new device, password changes)",
    category: "account",
    required: true,
  },
  emailWeeklyDigest: {
    label: "Weekly Digest",
    description: "Receive a weekly summary of your portal activity",
    category: "updates",
  },
  emailMarketingUpdates: {
    label: "News & Announcements",
    description: "Stay updated on company news and new features",
    category: "updates",
  },
};

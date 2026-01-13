import { useState } from "react";
import { Bell, Mail, Shield, Newspaper, Loader2, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useNotificationPreferences,
  NotificationPreferences as Preferences,
  NOTIFICATION_PREFERENCE_INFO,
} from "@/hooks/useNotificationPreferences";
import { cn } from "@/lib/utils";

interface NotificationPreferencesProps {
  className?: string;
}

const CATEGORY_INFO = {
  documents: {
    label: "Document Notifications",
    description: "Notifications about documents and NDAs",
    icon: Mail,
  },
  account: {
    label: "Account & Security",
    description: "Important account and security updates",
    icon: Shield,
  },
  updates: {
    label: "News & Updates",
    description: "Optional updates and announcements",
    icon: Newspaper,
  },
};

export function NotificationPreferences({ className }: NotificationPreferencesProps) {
  const {
    preferences,
    isLoading,
    isSaving,
    togglePreference,
    enableAll,
    disableOptional,
    resetToDefaults,
  } = useNotificationPreferences();

  const [pendingChanges, setPendingChanges] = useState<Set<keyof Preferences>>(new Set());

  // Group preferences by category
  const groupedPreferences = Object.entries(NOTIFICATION_PREFERENCE_INFO).reduce(
    (acc, [key, info]) => {
      if (!acc[info.category]) {
        acc[info.category] = [];
      }
      acc[info.category].push({ key: key as keyof Preferences, ...info });
      return acc;
    },
    {} as Record<string, Array<{ key: keyof Preferences; label: string; description: string; required?: boolean }>>
  );

  const handleToggle = async (key: keyof Preferences) => {
    // Don't allow toggling required preferences off
    if (NOTIFICATION_PREFERENCE_INFO[key].required && preferences[key]) {
      toast.error("Security alerts cannot be disabled");
      return;
    }

    setPendingChanges((prev) => new Set(prev).add(key));

    const success = await togglePreference(key);

    if (success) {
      toast.success(`${NOTIFICATION_PREFERENCE_INFO[key].label} ${preferences[key] ? "disabled" : "enabled"}`);
    } else {
      toast.error("Failed to update preference");
    }

    setPendingChanges((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleEnableAll = async () => {
    const success = await enableAll();
    if (success) {
      toast.success("All notifications enabled");
    }
  };

  const handleMinimal = async () => {
    const success = await disableOptional();
    if (success) {
      toast.success("Optional notifications disabled");
    }
  };

  const handleReset = async () => {
    const success = await resetToDefaults();
    if (success) {
      toast.success("Preferences reset to defaults");
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-white/60" />
        <span className="text-white/60 text-sm">Loading notification preferences...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-white/60" />
          <span className="text-white/80 text-sm">Email Notifications</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEnableAll}
            disabled={isSaving}
            className="text-white/60 hover:text-white hover:bg-white/5 text-xs"
          >
            Enable All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMinimal}
            disabled={isSaving}
            className="text-white/60 hover:text-white hover:bg-white/5 text-xs"
          >
            Minimal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="text-white/60 hover:text-white hover:bg-white/5 text-xs"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Preference Categories */}
      {(["documents", "account", "updates"] as const).map((category) => {
        const categoryInfo = CATEGORY_INFO[category];
        const CategoryIcon = categoryInfo.icon;
        const prefs = groupedPreferences[category] || [];

        return (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center gap-2">
              <CategoryIcon className="w-4 h-4 text-primary/70" />
              <h4 className="text-white/90 text-sm font-medium">{categoryInfo.label}</h4>
            </div>

            {/* Preference Items */}
            <div className="space-y-2 ml-6">
              {prefs.map(({ key, label, description, required }) => {
                const isPending = pendingChanges.has(key);
                const isEnabled = preferences[key];

                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      isEnabled
                        ? "bg-white/5 border-white/10"
                        : "bg-transparent border-white/5"
                    )}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white/90 text-sm">{label}</span>
                        {required && (
                          <span className="text-xs text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-xs mt-0.5 truncate">{description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : isEnabled ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : null}
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleToggle(key)}
                        disabled={isPending || (required && isEnabled)}
                        className={cn(
                          "data-[state=checked]:bg-primary",
                          required && isEnabled && "opacity-50"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Info Text */}
      <p className="text-white/40 text-xs ml-6">
        We'll only send emails when there's something important. You can unsubscribe from marketing emails at any time.
      </p>
    </div>
  );
}

export default NotificationPreferences;

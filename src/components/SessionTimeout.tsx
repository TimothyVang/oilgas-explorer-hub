import { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSessionTimeout, formatRemainingTime, SessionTimeoutConfig } from '@/hooks/useSessionTimeout';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

export interface SessionTimeoutProps extends SessionTimeoutConfig {
  /** Whether to show the dialog (for testing) */
  forceShow?: boolean;
}

/**
 * Session timeout warning dialog component.
 * Shows a dialog when the user is about to be logged out due to inactivity.
 */
export function SessionTimeout({
  timeoutDuration,
  warningDuration,
  activityEvents,
  onTimeout,
  onWarning,
  enabled = true,
  forceShow = false,
}: SessionTimeoutProps) {
  const { user } = useAuth();

  const {
    isWarningVisible,
    remainingTime,
    extendSession,
    logout,
  } = useSessionTimeout({
    timeoutDuration,
    warningDuration,
    activityEvents,
    onTimeout,
    onWarning,
    enabled: enabled && !!user,
  });

  const showDialog = forceShow || isWarningVisible;

  return (
    <AlertDialog open={showDialog}>
      <AlertDialogContent className="bg-midnight border-white/10 text-white max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-500/20 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-white">
              Session Expiring Soon
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-white/70">
            Your session will expire in{' '}
            <span className="text-amber-400 font-mono font-bold">
              {formatRemainingTime(remainingTime)}
            </span>{' '}
            due to inactivity.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <p className="text-sm text-white/60">
            Click "Stay Logged In" to continue your session, or "Log Out" to sign out now.
          </p>
        </div>

        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel
            onClick={logout}
            className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={extendSession}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * SessionTimeoutProvider - Wrapper component for session timeout management.
 * Place this at the app root level to enable session timeout globally.
 */
export function SessionTimeoutProvider({
  children,
  ...config
}: SessionTimeoutProps & { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SessionTimeout {...config} />
    </>
  );
}

export default SessionTimeout;

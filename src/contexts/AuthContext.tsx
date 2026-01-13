import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session, AuthenticatorAssuranceLevels } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { setSentryUser } from "@/lib/sentry";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaRequired: boolean;
  currentAAL: AuthenticatorAssuranceLevels | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; mfaRequired?: boolean }>;
  signOut: () => Promise<void>;
  checkMFAStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [currentAAL, setCurrentAAL] = useState<AuthenticatorAssuranceLevels | null>(null);

  // Check MFA status
  const checkMFAStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) {
        console.error("Error checking MFA status:", error);
        return;
      }

      setCurrentAAL(data.currentLevel);
      // MFA is required if user has MFA enabled (nextLevel is aal2) but hasn't verified yet (currentLevel is aal1)
      setMfaRequired(data.currentLevel === "aal1" && data.nextLevel === "aal2");
    } catch (error) {
      console.error("Error in checkMFAStatus:", error);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Update Sentry user context on auth state change
        if (session?.user) {
          setSentryUser({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'user',
          });
          // Check MFA status after login
          await checkMFAStatus();
        } else {
          setSentryUser(null);
          setMfaRequired(false);
          setCurrentAAL(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Set initial Sentry user context
      if (session?.user) {
        setSentryUser({
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'user',
        });
        // Check MFA status on initial load
        await checkMFAStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkMFAStatus]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      // Check MFA status after successful login
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const needsMFA = aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2";
      setMfaRequired(needsMFA);
      setCurrentAAL(aalData?.currentLevel || null);
      return { error: null, mfaRequired: needsMFA };
    }

    return { error, mfaRequired: false };
  };

  const signOut = async () => {
    // Clear Sentry user context on sign out
    setSentryUser(null);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    mfaRequired,
    currentAAL,
    signUp,
    signIn,
    signOut,
    checkMFAStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

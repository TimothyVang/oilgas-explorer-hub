import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Factor, AuthMFAEnrollResponse, AuthMFAChallengeResponse, AuthMFAVerifyResponse, AuthMFAListFactorsResponse, AuthenticatorAssuranceLevels } from "@supabase/supabase-js";

interface MFAState {
  factors: Factor[];
  isLoading: boolean;
  error: string | null;
  currentLevel: AuthenticatorAssuranceLevels | null;
  nextLevel: AuthenticatorAssuranceLevels | null;
}

interface EnrollResult {
  id: string;
  type: string;
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export function useMFA() {
  const [state, setState] = useState<MFAState>({
    factors: [],
    isLoading: true,
    error: null,
    currentLevel: null,
    nextLevel: null,
  });

  // Fetch MFA factors and assurance level
  const fetchMFAStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get list of enrolled factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        throw factorsError;
      }

      // Get current assurance level
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        throw aalError;
      }

      setState({
        factors: factorsData?.totp || [],
        isLoading: false,
        error: null,
        currentLevel: aalData?.currentLevel || null,
        nextLevel: aalData?.nextLevel || null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch MFA status",
      }));
    }
  }, []);

  // Enroll a new TOTP factor
  const enrollTOTP = useCallback(async (friendlyName?: string): Promise<EnrollResult | null> => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: friendlyName || "Authenticator App",
      });

      if (error) {
        throw error;
      }

      return data as EnrollResult;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to enroll TOTP",
      }));
      return null;
    }
  }, []);

  // Challenge and verify a TOTP code
  const verifyTOTP = useCallback(async (factorId: string, code: string): Promise<boolean> => {
    try {
      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        throw challengeError;
      }

      // Verify the code
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        throw verifyError;
      }

      // Refresh MFA status after verification
      await fetchMFAStatus();

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to verify TOTP code",
      }));
      return false;
    }
  }, [fetchMFAStatus]);

  // Unenroll a TOTP factor
  const unenrollTOTP = useCallback(async (factorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) {
        throw error;
      }

      // Refresh MFA status after unenrollment
      await fetchMFAStatus();

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to disable 2FA",
      }));
      return false;
    }
  }, [fetchMFAStatus]);

  // Generate backup codes (Supabase doesn't have native backup codes, so we track this via metadata)
  const generateBackupCodes = useCallback((): string[] => {
    const codes: string[] = [];
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < 8; i++) {
      let code = "";
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Format as XXXX-XXXX
      codes.push(code.slice(0, 4) + "-" + code.slice(4));
    }

    return codes;
  }, []);

  // Check if MFA is required for the current session
  const isMFARequired = useCallback((): boolean => {
    return state.currentLevel === "aal1" && state.nextLevel === "aal2";
  }, [state.currentLevel, state.nextLevel]);

  // Check if user has MFA enabled
  const hasMFAEnabled = useCallback((): boolean => {
    return state.factors.length > 0;
  }, [state.factors]);

  // Get the verified factor
  const getVerifiedFactor = useCallback((): Factor | null => {
    return state.factors.find(f => f.status === "verified") || null;
  }, [state.factors]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch MFA status on mount
  useEffect(() => {
    fetchMFAStatus();
  }, [fetchMFAStatus]);

  return {
    ...state,
    fetchMFAStatus,
    enrollTOTP,
    verifyTOTP,
    unenrollTOTP,
    generateBackupCodes,
    isMFARequired,
    hasMFAEnabled,
    getVerifiedFactor,
    clearError,
  };
}

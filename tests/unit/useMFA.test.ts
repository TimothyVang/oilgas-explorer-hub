import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMFA } from "@/hooks/useMFA";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      mfa: {
        listFactors: vi.fn(),
        getAuthenticatorAssuranceLevel: vi.fn(),
        enroll: vi.fn(),
        challenge: vi.fn(),
        verify: vi.fn(),
        unenroll: vi.fn(),
      },
    },
  },
}));

describe("useMFA Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (supabase.auth.mfa.listFactors as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { totp: [] },
      error: null,
    });
    (supabase.auth.mfa.getAuthenticatorAssuranceLevel as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal1" },
      error: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initialization", () => {
    it("should start with loading state", () => {
      const { result } = renderHook(() => useMFA());
      expect(result.current.isLoading).toBe(true);
    });

    it("should fetch MFA status on mount", async () => {
      const { result } = renderHook(() => useMFA());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(supabase.auth.mfa.listFactors).toHaveBeenCalled();
      expect(supabase.auth.mfa.getAuthenticatorAssuranceLevel).toHaveBeenCalled();
    });

    it("should set factors from API response", async () => {
      const mockFactors = [
        { id: "factor-1", type: "totp", status: "verified", created_at: "2024-01-01" },
      ];
      (supabase.auth.mfa.listFactors as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { totp: mockFactors },
        error: null,
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => {
        expect(result.current.factors).toEqual(mockFactors);
      });
    });

    it("should handle API error", async () => {
      (supabase.auth.mfa.listFactors as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: new Error("API Error"),
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => {
        expect(result.current.error).toBe("API Error");
      });
    });
  });

  describe("enrollTOTP", () => {
    it("should call Supabase enroll with correct parameters", async () => {
      const mockEnrollResult = {
        id: "factor-new",
        type: "totp",
        totp: {
          qr_code: "qr-code-data",
          secret: "TOTP_SECRET",
          uri: "otpauth://totp/...",
        },
      };
      (supabase.auth.mfa.enroll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockEnrollResult,
        error: null,
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      let enrollResult;
      await act(async () => {
        enrollResult = await result.current.enrollTOTP("My Auth App");
      });

      expect(supabase.auth.mfa.enroll).toHaveBeenCalledWith({
        factorType: "totp",
        friendlyName: "My Auth App",
      });
      expect(enrollResult).toEqual(mockEnrollResult);
    });

    it("should use default friendly name if not provided", async () => {
      (supabase.auth.mfa.enroll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { id: "factor-1" },
        error: null,
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        await result.current.enrollTOTP();
      });

      expect(supabase.auth.mfa.enroll).toHaveBeenCalledWith({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });
    });

    it("should handle enrollment error", async () => {
      (supabase.auth.mfa.enroll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: new Error("Enrollment failed"),
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      let enrollResult;
      await act(async () => {
        enrollResult = await result.current.enrollTOTP();
      });

      expect(enrollResult).toBeNull();
      expect(result.current.error).toBe("Enrollment failed");
    });
  });

  describe("verifyTOTP", () => {
    it("should challenge and verify TOTP code", async () => {
      (supabase.auth.mfa.challenge as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { id: "challenge-1" },
        error: null,
      });
      (supabase.auth.mfa.verify as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { access_token: "token" },
        error: null,
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      let verifyResult;
      await act(async () => {
        verifyResult = await result.current.verifyTOTP("factor-1", "123456");
      });

      expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({ factorId: "factor-1" });
      expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
        factorId: "factor-1",
        challengeId: "challenge-1",
        code: "123456",
      });
      expect(verifyResult).toBe(true);
    });

    it("should return false on verification error", async () => {
      (supabase.auth.mfa.challenge as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { id: "challenge-1" },
        error: null,
      });
      (supabase.auth.mfa.verify as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: new Error("Invalid code"),
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      let verifyResult;
      await act(async () => {
        verifyResult = await result.current.verifyTOTP("factor-1", "000000");
      });

      expect(verifyResult).toBe(false);
      expect(result.current.error).toBe("Invalid code");
    });

    it("should return false on challenge error", async () => {
      (supabase.auth.mfa.challenge as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: new Error("Challenge failed"),
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      let verifyResult;
      await act(async () => {
        verifyResult = await result.current.verifyTOTP("factor-1", "123456");
      });

      expect(verifyResult).toBe(false);
    });
  });

  describe("unenrollTOTP", () => {
    it("should unenroll factor successfully", async () => {
      (supabase.auth.mfa.unenroll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {},
        error: null,
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      let unenrollResult;
      await act(async () => {
        unenrollResult = await result.current.unenrollTOTP("factor-1");
      });

      expect(supabase.auth.mfa.unenroll).toHaveBeenCalledWith({ factorId: "factor-1" });
      expect(unenrollResult).toBe(true);
    });

    it("should handle unenroll error", async () => {
      (supabase.auth.mfa.unenroll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: new Error("Unenroll failed"),
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      let unenrollResult;
      await act(async () => {
        unenrollResult = await result.current.unenrollTOTP("factor-1");
      });

      expect(unenrollResult).toBe(false);
      expect(result.current.error).toBe("Unenroll failed");
    });
  });

  describe("helper functions", () => {
    it("hasMFAEnabled should return true when factors exist", async () => {
      (supabase.auth.mfa.listFactors as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { totp: [{ id: "factor-1", status: "verified" }] },
        error: null,
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      expect(result.current.hasMFAEnabled()).toBe(true);
    });

    it("hasMFAEnabled should return false when no factors", async () => {
      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      expect(result.current.hasMFAEnabled()).toBe(false);
    });

    it("isMFARequired should return true when aal1 and nextLevel is aal2", async () => {
      (supabase.auth.mfa.getAuthenticatorAssuranceLevel as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { currentLevel: "aal1", nextLevel: "aal2" },
        error: null,
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isMFARequired()).toBe(true);
    });

    it("isMFARequired should return false when aal2", async () => {
      (supabase.auth.mfa.getAuthenticatorAssuranceLevel as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { currentLevel: "aal2", nextLevel: "aal2" },
        error: null,
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isMFARequired()).toBe(false);
    });

    it("getVerifiedFactor should return the verified factor", async () => {
      const verifiedFactor = { id: "factor-1", status: "verified", type: "totp" };
      (supabase.auth.mfa.listFactors as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { totp: [verifiedFactor] },
        error: null,
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      expect(result.current.getVerifiedFactor()).toEqual(verifiedFactor);
    });

    it("generateBackupCodes should return 8 formatted codes", async () => {
      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      const codes = result.current.generateBackupCodes();

      expect(codes).toHaveLength(8);
      codes.forEach((code) => {
        expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      });
    });

    it("clearError should reset error state", async () => {
      (supabase.auth.mfa.enroll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: new Error("Test error"),
      });

      const { result } = renderHook(() => useMFA());

      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        await result.current.enrollTOTP();
      });

      expect(result.current.error).toBe("Test error");

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});

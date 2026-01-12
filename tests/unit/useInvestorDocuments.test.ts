import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', { value: mockOpen, writable: true });

// Mock logActivity
vi.mock("@/lib/logActivity", () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

// Mock useAuth - inline
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-123", email: "test@example.com" },
    session: { user: { id: "user-123", email: "test@example.com" } },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
  })),
}));

// Mock Supabase - inline
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
  },
}));

// Import AFTER mocks
import { useInvestorDocuments } from "@/hooks/useInvestorDocuments";
import { supabase } from "@/integrations/supabase/client";

describe("useInvestorDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpen.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial Loading State", () => {
    it("should start with loading state", async () => {
      const { result } = renderHook(() => useInvestorDocuments());
      expect(result.current.loading).toBe(true);
    });

    it("should return user from auth context", async () => {
      const { result } = renderHook(() => useInvestorDocuments());
      expect(result.current.user).toEqual({ id: "user-123", email: "test@example.com" });
    });
  });

  describe("NDA Status", () => {
    it("should fetch NDA status from profiles", async () => {
      const profileData = { nda_signed: true, nda_signed_at: "2024-01-01T00:00:00Z" };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: profileData, error: null }),
          }),
        }),
      } as never);

      const { result } = renderHook(() => useInvestorDocuments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.ndaStatus).toEqual(profileData);
    });

    it("should handle profile fetch error gracefully", async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" }
            }),
          }),
        }),
      } as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useInvestorDocuments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.ndaStatus).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("Documents Fetching", () => {
    it("should return empty documents when NDA not signed", async () => {
      const profileData = { nda_signed: false, nda_signed_at: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: profileData, error: null }),
          }),
        }),
      } as never);

      const { result } = renderHook(() => useInvestorDocuments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.documents).toEqual([]);
    });
  });

  describe("User Actions", () => {
    it("should handle NDA signing by opening DocuSign URL", async () => {
      const { result } = renderHook(() => useInvestorDocuments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleSignNda();
      });

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining("docusign"),
        "_blank"
      );
    });

    it("should handle document access by opening file URL", async () => {
      const { result } = renderHook(() => useInvestorDocuments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const testDoc = {
        id: "doc-123",
        title: "Test Document",
        description: "Test description",
        file_url: "https://example.com/doc.pdf",
        created_at: "2024-01-01",
      };

      await act(async () => {
        await result.current.handleDocumentAccess(testDoc);
      });

      expect(mockOpen).toHaveBeenCalledWith(testDoc.file_url, "_blank");
    });

    it("should log NDA sign initiation activity", async () => {
      const { logActivity } = await import("@/lib/logActivity");
      
      const { result } = renderHook(() => useInvestorDocuments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleSignNda();
      });

      expect(logActivity).toHaveBeenCalledWith(
        "nda_sign_initiated",
        expect.objectContaining({ redirect_url: expect.any(String) })
      );
    });

    it("should log document access activity", async () => {
      const { logActivity } = await import("@/lib/logActivity");
      
      const { result } = renderHook(() => useInvestorDocuments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const testDoc = {
        id: "doc-123",
        title: "Test Document",
        description: null,
        file_url: "https://example.com/doc.pdf",
        created_at: "2024-01-01",
      };

      await act(async () => {
        await result.current.handleDocumentAccess(testDoc);
      });

      expect(logActivity).toHaveBeenCalledWith(
        "document_access",
        expect.objectContaining({
          document_id: testDoc.id,
          document_title: testDoc.title,
        })
      );
    });
  });

  describe("DocuSign URL Configuration", () => {
    it("should include DocuSign URL in return value", async () => {
      const { result } = renderHook(() => useInvestorDocuments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.DOCUSIGN_NDA_URL).toBeDefined();
      expect(result.current.DOCUSIGN_NDA_URL).toContain("docusign");
    });
  });
});

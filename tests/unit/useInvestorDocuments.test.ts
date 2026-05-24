import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const mockOpen = vi.fn();
Object.defineProperty(window, "open", { value: mockOpen, writable: true });

const mockLogActivity = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/logActivity", () => ({
  logActivity: (...args: unknown[]) => mockLogActivity(...args),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-123", email: "test@example.com" },
    session: { user: { id: "user-123", email: "test@example.com" } },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  })),
}));

let profileData: { nda_signed: boolean; nda_signed_at: string | null } | null = { nda_signed: false, nda_signed_at: null };
let profileError: unknown = null;
let accessData: Array<{ document_id: string }> = [];
let docsData: unknown[] = [];
const mockInvoke = vi.fn().mockResolvedValue({ data: { signed_url: "https://signed.example.com/doc.pdf" }, error: null });

const createOrderedQuery = () => {
  const query = Promise.resolve({ data: docsData, error: null }) as Promise<{
    data: unknown[];
    error: null;
  }> & { order: ReturnType<typeof vi.fn> };
  query.order = vi.fn(() => query);
  return query;
};

const waitForHookToSettle = (result: { current: ReturnType<typeof useInvestorDocuments> }) =>
  waitFor(() => expect(result.current.loading).toBe(false), { timeout: 7000 });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: profileData, error: profileError }),
            })),
          })),
        };
      }

      if (table === "user_document_access") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: accessData, error: null }),
          })),
        };
      }

      if (table === "investor_documents") {
        return {
          select: vi.fn(() => ({
            in: vi.fn(() => createOrderedQuery()),
          })),
        };
      }

      return { select: vi.fn() };
    }),
  },
}));

import { useInvestorDocuments, type InvestorDocument } from "@/hooks/useInvestorDocuments";

const testAsset: InvestorDocument = {
  id: "doc-123",
  title: "Test Document",
  description: "Test description",
  created_at: "2024-01-01",
  category: "pitch",
  asset_type: "document",
  file_size: 1024,
  mime_type: "application/pdf",
  original_filename: "test.pdf",
  thumbnail_path: null,
  sort_order: 0,
  is_featured: false,
};

describe("useInvestorDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpen.mockClear();
    profileData = { nda_signed: false, nda_signed_at: null };
    profileError = null;
    accessData = [];
    docsData = [];
    mockInvoke.mockResolvedValue({ data: { signed_url: "https://signed.example.com/doc.pdf" }, error: null });
  });

  it("starts with loading state", async () => {
    const { result } = renderHook(() => useInvestorDocuments());
    expect(result.current.loading).toBe(true);
    await waitForHookToSettle(result);
  });

  it("returns the authenticated user", async () => {
    const { result } = renderHook(() => useInvestorDocuments());
    expect(result.current.user).toEqual({ id: "user-123", email: "test@example.com" });
    await waitForHookToSettle(result);
  });

  it("fetches NDA status from profiles", async () => {
    profileData = { nda_signed: true, nda_signed_at: "2024-01-01T00:00:00Z" };

    const { result } = renderHook(() => useInvestorDocuments());

    await waitForHookToSettle(result);
    expect(result.current.ndaStatus).toEqual(profileData);
  });

  it("handles profile fetch errors gracefully", async () => {
    profileError = { message: "Database error" };
    profileData = null;
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useInvestorDocuments());

    await waitForHookToSettle(result);
    expect(result.current.ndaStatus).toBeNull();
    consoleSpy.mockRestore();
  });

  it("returns empty documents when NDA is not signed", async () => {
    profileData = { nda_signed: false, nda_signed_at: null };

    const { result } = renderHook(() => useInvestorDocuments());

    await waitForHookToSettle(result);
    expect(result.current.documents).toEqual([]);
  });

  it("fetches assigned documents when NDA is signed", async () => {
    profileData = { nda_signed: true, nda_signed_at: "2024-01-01T00:00:00Z" };
    accessData = [{ document_id: "doc-123" }];
    docsData = [testAsset];

    const { result } = renderHook(() => useInvestorDocuments());

    await waitForHookToSettle(result);
    expect(result.current.documents).toEqual([testAsset]);
  });

  it("opens DocuSign URL when NDA signing starts", async () => {
    const { result } = renderHook(() => useInvestorDocuments());

    await result.current.handleSignNda();

    expect(mockOpen).toHaveBeenCalledWith(expect.stringContaining("docusign"), "_blank");
    expect(mockLogActivity).toHaveBeenCalledWith("nda_sign_initiated", expect.objectContaining({ redirect_url: expect.any(String) }));
  });

  it("requests a signed URL before opening an asset", async () => {
    const { result } = renderHook(() => useInvestorDocuments());

    await result.current.handleDocumentAccess(testAsset);

    expect(mockInvoke).toHaveBeenCalledWith("create-asset-access-url", { body: { document_id: testAsset.id, mode: "preview" } });
    expect(mockOpen).toHaveBeenCalledWith("https://signed.example.com/doc.pdf", "_blank", "noopener,noreferrer");
    expect(mockLogActivity).toHaveBeenCalledWith("document_access", expect.objectContaining({
      document_id: testAsset.id,
      document_title: testAsset.title,
    }));
  });

  it("includes DocuSign URL in return value", async () => {
    const { result } = renderHook(() => useInvestorDocuments());

    expect(result.current.DOCUSIGN_NDA_URL).toContain("docusign");
  });
});

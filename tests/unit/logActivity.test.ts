import { describe, it, expect, vi, beforeEach } from "vitest";
import { logActivity, type ActivityAction } from "@/lib/logActivity";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
    })),
  },
}));

import { supabase } from "@/integrations/supabase/client";

describe("logActivity utility function", () => {
  const mockUser = {
    id: "test-user-123",
    email: "test@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs/errors in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should log activity when user is authenticated", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as any);

    await logActivity("sign_in");

    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith("activity_logs");
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: mockUser.id,
      action: "sign_in",
      metadata: {},
    });
  });

  it("should include metadata when provided", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as any);

    const metadata = {
      document_id: "doc-123",
      document_name: "Investment Report",
    };

    await logActivity("document_access", metadata);

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: mockUser.id,
      action: "document_access",
      metadata,
    });
  });

  it("should skip logging when no user is authenticated", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await logActivity("sign_in");

    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      "No user found, skipping activity log"
    );
  });

  it("should handle Supabase insert errors gracefully", async () => {
    const mockError = { message: "Insert failed", code: "23505" };
    const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as any);

    // Should not throw
    await expect(logActivity("profile_update")).resolves.not.toThrow();
    expect(console.error).toHaveBeenCalledWith(
      "Failed to log activity:",
      mockError
    );
  });

  it("should handle unexpected errors gracefully", async () => {
    const unexpectedError = new Error("Network error");
    vi.mocked(supabase.auth.getUser).mockRejectedValue(unexpectedError);

    // Should not throw
    await expect(logActivity("sign_out")).resolves.not.toThrow();
    expect(console.error).toHaveBeenCalledWith(
      "Error logging activity:",
      unexpectedError
    );
  });

  describe("ActivityAction types", () => {
    const validActions: ActivityAction[] = [
      "sign_in",
      "sign_out",
      "profile_update",
      "document_access",
      "nda_signed",
      "nda_sign_initiated",
      "admin_nda_reset",
      "admin_document_created",
      "admin_document_updated",
      "admin_document_deleted",
      "admin_bulk_document_assign",
      "admin_bulk_nda_reset",
    ];

    it.each(validActions)("should accept valid action type: %s", async (action) => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      await logActivity(action);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ action })
      );
    });
  });

  describe("metadata handling", () => {
    beforeEach(() => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);
    });

    it("should handle string metadata values", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      await logActivity("document_access", { file_name: "report.pdf" });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { file_name: "report.pdf" },
        })
      );
    });

    it("should handle number metadata values", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      await logActivity("document_access", { file_size: 1024 });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { file_size: 1024 },
        })
      );
    });

    it("should handle boolean metadata values", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      await logActivity("profile_update", { email_changed: true });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { email_changed: true },
        })
      );
    });

    it("should handle null metadata values", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      await logActivity("profile_update", { previous_value: null });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { previous_value: null },
        })
      );
    });

    it("should handle empty metadata object", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      await logActivity("sign_in", {});

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {},
        })
      );
    });
  });
});

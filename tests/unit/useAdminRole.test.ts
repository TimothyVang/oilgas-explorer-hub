import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mocks must be defined inside vi.mock factory - no external variable references
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

// Mock Supabase - all inline
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
    })),
  },
}));

// Import AFTER mocks are defined
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

describe("useAdminRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial State", () => {
    it("should start with loading state", async () => {
      const { result } = renderHook(() => useAdminRole());
      expect(result.current.loading).toBe(true);
    });

    it("should default isAdmin to false", async () => {
      const { result } = renderHook(() => useAdminRole());
      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe("Admin Role Detection", () => {
    it("should set isAdmin to true when user has admin role", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { role: "admin" },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      } as never);

      const { result } = renderHook(() => useAdminRole());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(true);
    });

    it("should set isAdmin to false when user does not have admin role", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      } as never);

      const { result } = renderHook(() => useAdminRole());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
    });

    it("should set isAdmin to false on database error", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      } as never);

      const { result } = renderHook(() => useAdminRole());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe("Supabase Queries", () => {
    it("should query user_roles table", async () => {
      renderHook(() => useAdminRole());

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith("user_roles");
      });
    });
  });

  describe("No User State", () => {
    it("should return isAdmin false when no user is logged in", async () => {
      vi.mocked(useAuth).mockReturnValueOnce({
        user: null,
        session: null,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        signInWithGoogle: vi.fn(),
      });

      const { result } = renderHook(() => useAdminRole());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe("Loading States", () => {
    it("should set loading to false after admin check completes", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { role: "admin" },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      } as never);

      const { result } = renderHook(() => useAdminRole());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("Return Value Structure", () => {
    it("should return object with isAdmin and loading properties", async () => {
      const { result } = renderHook(() => useAdminRole());

      expect(result.current).toHaveProperty("isAdmin");
      expect(result.current).toHaveProperty("loading");
    });

    it("should have correct types for return values", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      } as never);

      const { result } = renderHook(() => useAdminRole());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.isAdmin).toBe("boolean");
      expect(typeof result.current.loading).toBe("boolean");
    });
  });
});

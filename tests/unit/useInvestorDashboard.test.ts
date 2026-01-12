import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

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
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    })),
  },
}));

// Import AFTER mocks
import { useInvestorDashboard } from "@/hooks/useInvestorDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

describe("useInvestorDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial State", () => {
    it("should start with loading state", () => {
      const { result } = renderHook(() => useInvestorDashboard());
      expect(result.current.loading).toBe(true);
    });

    it("should have default stats values", () => {
      const { result } = renderHook(() => useInvestorDashboard());

      expect(result.current.stats).toEqual({
        totalDocuments: 0,
        assignedDocuments: 0,
        ndaSigned: false,
        ndaSignedAt: null,
        recentActivity: [],
        pendingTasks: [],
      });
    });
  });

  describe("Stats Fetching", () => {
    it("should fetch dashboard stats from Supabase", async () => {
      const { result } = renderHook(() => useInvestorDashboard());

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled();
      });
    });
  });

  describe("Pending Tasks", () => {
    it("should include NDA task when not signed", async () => {
      // Setup mock for profile with NDA not signed
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { nda_signed: false, nda_signed_at: null },
                  error: null,
                }),
              }),
            }),
          } as never;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              })),
            }),
          }),
        } as never;
      });

      const { result } = renderHook(() => useInvestorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const ndaTask = result.current.stats.pendingTasks.find(t => t.type === "nda");
      expect(ndaTask).toBeDefined();
      expect(ndaTask?.status).toBe("critical");
    });
  });

  describe("No User State", () => {
    it("should return default stats when no user", async () => {
      vi.mocked(useAuth).mockReturnValueOnce({
        user: null,
        session: null,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        signInWithGoogle: vi.fn(),
      });

      const { result } = renderHook(() => useInvestorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats.totalDocuments).toBe(0);
      expect(result.current.stats.assignedDocuments).toBe(0);
      expect(result.current.stats.ndaSigned).toBe(false);
    });
  });

  describe("Return Value Structure", () => {
    it("should return stats and loading", async () => {
      const { result } = renderHook(() => useInvestorDashboard());

      expect(result.current).toHaveProperty("stats");
      expect(result.current).toHaveProperty("loading");
    });

    it("should have correct stats structure", async () => {
      const { result } = renderHook(() => useInvestorDashboard());

      expect(result.current.stats).toHaveProperty("totalDocuments");
      expect(result.current.stats).toHaveProperty("assignedDocuments");
      expect(result.current.stats).toHaveProperty("ndaSigned");
      expect(result.current.stats).toHaveProperty("ndaSignedAt");
      expect(result.current.stats).toHaveProperty("recentActivity");
      expect(result.current.stats).toHaveProperty("pendingTasks");
    });
  });
});

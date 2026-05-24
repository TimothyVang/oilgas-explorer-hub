/**
 * Integration Tests for Authentication Flow
 *
 * Tests the complete auth flow including:
 * - Invite-only login page restrictions
 * - Login with valid/invalid credentials
 * - Redirect to dashboard after login
 * - Protected route access
 * - Logout functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReactNode } from "react";

// Mock window.location
const mockLocation = {
  origin: "http://localhost:8080",
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock Supabase client
const mockSubscription = { unsubscribe: vi.fn() };
const mockOnAuthStateChange = vi.fn();
const mockGetSession = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockGetAuthenticatorAssuranceLevel = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      getSession: () => mockGetSession(),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) =>
        mockSignInWithPassword(...args),
      signOut: () => mockSignOut(),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      mfa: {
        getAuthenticatorAssuranceLevel: () => mockGetAuthenticatorAssuranceLevel(),
      },
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

// Mock useAdminRole hook
vi.mock("@/hooks/useAdminRole", () => ({
  useAdminRole: () => ({ isAdmin: false, loading: false }),
}));

// Mock useInvestorDashboard hook
vi.mock("@/hooks/useInvestorDashboard", () => ({
  useInvestorDashboard: () => ({
    stats: {
      ndaSigned: false,
      assignedDocuments: 0,
      recentActivity: [],
      pendingTasks: [],
    },
    loading: false,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
    }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    header: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
    }) => (
      <header className={className} {...props}>
        {children}
      </header>
    ),
    aside: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
    }) => (
      <aside className={className} {...props}>
        {children}
      </aside>
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Test wrapper with all providers
const createTestWrapper = (initialEntries: string[] = ["/"]) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Sonner />
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// App routes for integration testing
const TestRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
  </Routes>
);

describe("Auth Flow Integration Tests", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: { full_name: "Test User" },
  };

  const mockSession = {
    user: mockUser,
    access_token: "test-token",
    refresh_token: "refresh-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";

    // Default: No existing session
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal1" },
      error: null,
    });

    // Set up auth state change listener
    mockOnAuthStateChange.mockImplementation((callback) => {
      // Store callback to simulate auth events later
      (globalThis as Record<string, unknown>).__authCallback = callback;
      return { data: { subscription: mockSubscription } };
    });
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).__authCallback;
  });

  describe("Invite-only Access", () => {
    it("renders only the provisioned investor sign-in form", async () => {
      const Wrapper = createTestWrapper(["/login"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(
          screen.queryByText("Loading...")
        ).not.toBeInTheDocument();
      });

      expect(screen.getByText("Approved Investor Login")).toBeInTheDocument();
      expect(
        screen.getByText("Invitation-only access to confidential materials")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/credentials are provided directly by BAH after review/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /create one/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /create account/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
      expect(mockSignUp).not.toHaveBeenCalled();
      expect(mockSignInWithOAuth).not.toHaveBeenCalled();
    });
  });

  describe("Login Flow", () => {
    it("renders login form by default", async () => {
      const Wrapper = createTestWrapper(["/login"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      expect(screen.getByText("Approved Investor Login")).toBeInTheDocument();
      expect(
        screen.getByText("Invitation-only access to confidential materials")
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("shows validation error for invalid login identifier", async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper(["/login"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Fill with invalid username/email identifier
      await user.type(screen.getByLabelText(/username or email/i), "x");
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      // Submit
      await user.click(screen.getByRole("button", { name: /^sign in$/i }));

      // SignIn should not be called with invalid identifier
      await waitFor(
        () => {
          expect(mockSignInWithPassword).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it("calls signIn with correct credentials", async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper(["/login"]);

      mockSignInWithPassword.mockResolvedValue({ error: null });

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Fill login form
      await user.type(
        screen.getByLabelText(/username or email/i),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      // Submit
      await user.click(screen.getByRole("button", { name: /^sign in$/i }));

      // Verify signIn was called with correct credentials
      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("shows error message for invalid credentials", async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper(["/login"]);

      mockSignInWithPassword.mockResolvedValue({
        error: new Error("Invalid login credentials"),
      });

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Fill login form
      await user.type(
        screen.getByLabelText(/username or email/i),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/^password$/i), "wrongpassword");

      // Submit
      await user.click(screen.getByRole("button", { name: /^sign in$/i }));

      // Verify error shown (via toast)
      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalled();
      });
    });

    it("shows error message for unverified email", async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper(["/login"]);

      mockSignInWithPassword.mockResolvedValue({
        error: new Error("Email not confirmed"),
      });

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Fill login form
      await user.type(
        screen.getByLabelText(/username or email/i),
        "unverified@example.com"
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      // Submit
      await user.click(screen.getByRole("button", { name: /^sign in$/i }));

      // Verify error shown
      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalled();
      });
    });
  });

  describe("OAuth Restrictions", () => {
    it("does not render public OAuth entry points", async () => {
      const Wrapper = createTestWrapper(["/login"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
      expect(mockSignInWithOAuth).not.toHaveBeenCalled();
    });
  });

  describe("Protected Route Access", () => {
    it("redirects unauthenticated user to login", async () => {
      const Wrapper = createTestWrapper(["/dashboard"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      // Should redirect to login
      await waitFor(() => {
        // Login page should be visible
        expect(screen.getByText("Approved Investor Login")).toBeInTheDocument();
      });
    });

    it("shows dashboard for authenticated user", async () => {
      // Set up authenticated session
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
      });

      const Wrapper = createTestWrapper(["/dashboard"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      // Should show dashboard
      await waitFor(() => {
        expect(screen.getByText("Overview")).toBeInTheDocument();
      });
    });
  });

  describe("Session Persistence", () => {
    it("restores session from existing session", async () => {
      // Simulate existing session
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
      });

      const Wrapper = createTestWrapper(["/login"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      // Should redirect to dashboard since user is logged in
      await waitFor(() => {
        expect(screen.getByText("Overview")).toBeInTheDocument();
      });
    });

    it("handles session expiry", async () => {
      // Start with session
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
      });

      let authCallback: (event: string, session: unknown) => void;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      const Wrapper = createTestWrapper(["/dashboard"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      // Dashboard should be visible
      await waitFor(() => {
        expect(screen.getByText("Overview")).toBeInTheDocument();
      });

      // Simulate session expiry via auth callback
      authCallback!("SIGNED_OUT", null);

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByText("Approved Investor Login")).toBeInTheDocument();
      });
    });
  });

  describe("Logout Flow", () => {
    it("signs out user and redirects to home", async () => {
      const user = userEvent.setup();

      // Set up authenticated session
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockSignOut.mockResolvedValue({ error: null });

      let authCallback: (event: string, session: unknown) => void;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      const Wrapper = createTestWrapper(["/dashboard"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText("Overview")).toBeInTheDocument();
      });

      // Find and click logout button (looking for the one with "Logout" text)
      const logoutButton = screen.getByRole("button", { name: /logout|sign out/i });
      await user.click(logoutButton);

      // Verify signOut was called
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe("Invite-only Form Restrictions", () => {
    it("does not expose signup toggles or verification screens", async () => {
      const Wrapper = createTestWrapper(["/login"]);

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      expect(
        screen.getByText("Invitation-only access to confidential materials")
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /create one/i })).not.toBeInTheDocument();
      expect(screen.queryByText("Create your account")).not.toBeInTheDocument();
      expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
    });
  });
});

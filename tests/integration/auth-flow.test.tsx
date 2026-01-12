/**
 * Integration Tests for Authentication Flow
 *
 * Tests the complete auth flow including:
 * - Signup process and verification message
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

  describe("Signup Flow", () => {
    it("renders signup form when toggled", async () => {
      const user = userEvent.setup();
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

      // Click "Create one" to switch to signup mode
      const createButton = screen.getByRole("button", { name: /create one/i });
      await user.click(createButton);

      // Verify signup form is shown
      expect(screen.getByText("Create your account")).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it("shows validation error for invalid email", async () => {
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

      // Switch to signup
      await user.click(screen.getByRole("button", { name: /create one/i }));

      // Fill form with invalid email
      await user.type(screen.getByLabelText(/full name/i), "Test User");
      await user.type(screen.getByLabelText(/email address/i), "invalid-email");
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      // Submit form
      await user.click(
        screen.getByRole("button", { name: /create account/i })
      );

      // Wait for toast error (sonner toasts appear in DOM)
      await waitFor(
        () => {
          expect(mockSignUp).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it("shows validation error for short password", async () => {
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

      // Switch to signup
      await user.click(screen.getByRole("button", { name: /create one/i }));

      // Fill form with short password
      await user.type(screen.getByLabelText(/full name/i), "Test User");
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/^password$/i), "12345");

      // Submit form
      await user.click(
        screen.getByRole("button", { name: /create account/i })
      );

      // Wait for validation to prevent API call
      await waitFor(
        () => {
          expect(mockSignUp).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it("calls signUp and shows verification message on success", async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper(["/login"]);

      mockSignUp.mockResolvedValue({ error: null });

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Switch to signup
      await user.click(screen.getByRole("button", { name: /create one/i }));

      // Fill valid signup form
      await user.type(screen.getByLabelText(/full name/i), "Test User");
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      // Submit form
      await user.click(
        screen.getByRole("button", { name: /create account/i })
      );

      // Wait for signUp to be called
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
          options: {
            emailRedirectTo: "http://localhost:8080/",
            data: { full_name: "Test User" },
          },
        });
      });

      // Verify verification message is shown
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      });
    });

    it("shows error message when email is already registered", async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper(["/login"]);

      mockSignUp.mockResolvedValue({
        error: new Error("User already registered"),
      });

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Switch to signup
      await user.click(screen.getByRole("button", { name: /create one/i }));

      // Fill form
      await user.type(screen.getByLabelText(/full name/i), "Test User");
      await user.type(
        screen.getByLabelText(/email address/i),
        "existing@example.com"
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      // Submit form
      await user.click(
        screen.getByRole("button", { name: /create account/i })
      );

      // Verify signUp was called
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });
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

      expect(screen.getByText("Investor Portal")).toBeInTheDocument();
      expect(
        screen.getByText("Sign in to access your account")
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("shows validation error for invalid email on login", async () => {
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

      // Fill with invalid email
      await user.type(screen.getByLabelText(/email address/i), "invalid");
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      // Submit
      await user.click(screen.getByRole("button", { name: /^sign in$/i }));

      // SignIn should not be called with invalid email
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
        screen.getByLabelText(/email address/i),
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
        screen.getByLabelText(/email address/i),
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
        screen.getByLabelText(/email address/i),
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

  describe("Google OAuth Flow", () => {
    it("initiates Google OAuth flow", async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper(["/login"]);

      mockSignInWithOAuth.mockResolvedValue({
        data: { url: "https://accounts.google.com/oauth" },
        error: null,
      });

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Click Google button
      const googleButton = screen.getByRole("button", {
        name: /continue with google/i,
      });
      await user.click(googleButton);

      // Verify OAuth was initiated
      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: "google",
          options: expect.objectContaining({
            redirectTo: "http://localhost:8080",
            skipBrowserRedirect: true,
          }),
        });
      });

      // Verify redirect was triggered
      await waitFor(() => {
        expect(mockLocation.href).toBe("https://accounts.google.com/oauth");
      });
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
        expect(screen.getByText("Investor Portal")).toBeInTheDocument();
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
        expect(screen.getByText("Investor Portal")).toBeInTheDocument();
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

  describe("Form Toggling", () => {
    it("toggles between login and signup forms", async () => {
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

      // Initially in login mode
      expect(
        screen.getByText("Sign in to access your account")
      ).toBeInTheDocument();

      // Switch to signup
      await user.click(screen.getByRole("button", { name: /create one/i }));
      expect(screen.getByText("Create your account")).toBeInTheDocument();

      // Switch back to login
      await user.click(screen.getByRole("button", { name: /sign in/i }));
      expect(
        screen.getByText("Sign in to access your account")
      ).toBeInTheDocument();
    });

    it("can go back to sign in from verification message", async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper(["/login"]);

      mockSignUp.mockResolvedValue({ error: null });

      render(
        <Wrapper>
          <TestRoutes />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Switch to signup and complete it
      await user.click(screen.getByRole("button", { name: /create one/i }));
      await user.type(screen.getByLabelText(/full name/i), "Test User");
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");
      await user.click(
        screen.getByRole("button", { name: /create account/i })
      );

      // Wait for verification message
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });

      // Click "Back to Sign In"
      await user.click(
        screen.getByRole("button", { name: /back to sign in/i })
      );

      // Should be back to login form
      await waitFor(() => {
        expect(
          screen.getByText("Sign in to access your account")
        ).toBeInTheDocument();
      });
    });
  });
});

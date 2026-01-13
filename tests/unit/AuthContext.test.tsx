import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

// Mock window.location
const mockLocation = {
  origin: "http://localhost:8080",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock Supabase client
const mockSubscription = { unsubscribe: vi.fn() };
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: mockSubscription },
}));
const mockGetSession = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetAuthenticatorAssuranceLevel = vi.fn();
const mockListFactors = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      getSession: () => mockGetSession(),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: () => mockSignOut(),
      mfa: {
        getAuthenticatorAssuranceLevel: () => mockGetAuthenticatorAssuranceLevel(),
        listFactors: () => mockListFactors(),
      },
    },
  },
}));

// Test component to consume AuthContext
const TestConsumer = () => {
  const { user, session, loading, signUp, signIn, signOut } = useAuth();

  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
      <span data-testid="session">{session ? "active" : "null"}</span>
      <button onClick={() => signUp("test@example.com", "password123", "Test User")}>
        Sign Up
      </button>
      <button onClick={() => signIn("test@example.com", "password123")}>
        Sign In
      </button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
};

// Wrapper component for testing
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
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
    // Default mock implementations
    mockGetSession.mockResolvedValue({ data: { session: null } });
    // Default MFA mocks
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal1" },
      error: null,
    });
    mockListFactors.mockResolvedValue({
      data: { totp: [] },
      error: null,
    });
  });

  describe("useAuth hook", () => {
    it("throws error when used outside AuthProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("AuthProvider", () => {
    it("initializes with loading state", async () => {
      // Make getSession a pending promise to keep loading true
      mockGetSession.mockReturnValue(new Promise(() => {}));

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("true");
    });

    it("sets up auth state listener on mount", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    it("checks for existing session on mount", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled();
      });
    });

    it("sets user from existing session", async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
      });

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
        expect(screen.getByTestId("session")).toHaveTextContent("active");
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
    });

    it("handles no existing session", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("null");
        expect(screen.getByTestId("session")).toHaveTextContent("null");
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
    });

    it("unsubscribes from auth listener on unmount", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const { unmount } = render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it("updates state when auth state changes", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      // Capture the callback passed to onAuthStateChange
      let authCallback: (event: string, session: unknown) => void;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      // Initially no user
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("null");
      });

      // Simulate auth state change (user signs in)
      await act(async () => {
        authCallback("SIGNED_IN", mockSession);
      });

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
        expect(screen.getByTestId("session")).toHaveTextContent("active");
      });
    });
  });

  describe("signUp", () => {
    it("calls Supabase signUp with correct parameters", async () => {
      const user = userEvent.setup();
      mockGetSession.mockResolvedValue({ data: { session: null } });
      mockSignUp.mockResolvedValue({ error: null });

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      await user.click(screen.getByText("Sign Up"));

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          emailRedirectTo: "http://localhost:8080/",
          data: {
            full_name: "Test User",
          },
        },
      });
    });

    it("returns null error on successful signup", async () => {
      const user = userEvent.setup();
      mockGetSession.mockResolvedValue({ data: { session: null } });
      mockSignUp.mockResolvedValue({ error: null });

      let signUpResult: { error: Error | null } | undefined;

      const TestSignUp = () => {
        const { signUp } = useAuth();
        return (
          <button
            onClick={async () => {
              signUpResult = await signUp("test@example.com", "pass", "Test");
            }}
          >
            Sign Up
          </button>
        );
      };

      render(
        <TestWrapper>
          <TestSignUp />
        </TestWrapper>
      );

      await user.click(screen.getByText("Sign Up"));

      await waitFor(() => {
        expect(signUpResult).toEqual({ error: null });
      });
    });

    it("returns error on failed signup", async () => {
      const user = userEvent.setup();
      const mockError = new Error("Email already registered");
      mockGetSession.mockResolvedValue({ data: { session: null } });
      mockSignUp.mockResolvedValue({ error: mockError });

      let signUpResult: { error: Error | null } | undefined;

      const TestSignUp = () => {
        const { signUp } = useAuth();
        return (
          <button
            onClick={async () => {
              signUpResult = await signUp("test@example.com", "pass", "Test");
            }}
          >
            Sign Up
          </button>
        );
      };

      render(
        <TestWrapper>
          <TestSignUp />
        </TestWrapper>
      );

      await user.click(screen.getByText("Sign Up"));

      await waitFor(() => {
        expect(signUpResult?.error).toBe(mockError);
      });
    });
  });

  describe("signIn", () => {
    it("calls Supabase signInWithPassword with correct parameters", async () => {
      const user = userEvent.setup();
      mockGetSession.mockResolvedValue({ data: { session: null } });
      mockSignInWithPassword.mockResolvedValue({ error: null });

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      await user.click(screen.getByText("Sign In"));

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("returns null error on successful signin", async () => {
      const user = userEvent.setup();
      mockGetSession.mockResolvedValue({ data: { session: null } });
      mockSignInWithPassword.mockResolvedValue({ error: null });

      let signInResult: { error: Error | null } | undefined;

      const TestSignIn = () => {
        const { signIn } = useAuth();
        return (
          <button
            onClick={async () => {
              signInResult = await signIn("test@example.com", "pass");
            }}
          >
            Sign In
          </button>
        );
      };

      render(
        <TestWrapper>
          <TestSignIn />
        </TestWrapper>
      );

      await user.click(screen.getByText("Sign In"));

      await waitFor(() => {
        expect(signInResult).toEqual({ error: null, mfaRequired: false });
      });
    });

    it("returns error on failed signin", async () => {
      const user = userEvent.setup();
      const mockError = new Error("Invalid credentials");
      mockGetSession.mockResolvedValue({ data: { session: null } });
      mockSignInWithPassword.mockResolvedValue({ error: mockError });

      let signInResult: { error: Error | null } | undefined;

      const TestSignIn = () => {
        const { signIn } = useAuth();
        return (
          <button
            onClick={async () => {
              signInResult = await signIn("test@example.com", "wrong");
            }}
          >
            Sign In
          </button>
        );
      };

      render(
        <TestWrapper>
          <TestSignIn />
        </TestWrapper>
      );

      await user.click(screen.getByText("Sign In"));

      await waitFor(() => {
        expect(signInResult?.error).toBe(mockError);
      });
    });
  });

  describe("signOut", () => {
    it("calls Supabase signOut", async () => {
      const user = userEvent.setup();
      mockGetSession.mockResolvedValue({ data: { session: mockSession } });
      mockSignOut.mockResolvedValue({ error: null });

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
      });

      await user.click(screen.getByText("Sign Out"));

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("context value", () => {
    it("provides all expected values", async () => {
      mockGetSession.mockResolvedValue({ data: { session: mockSession } });

      let contextValue: ReturnType<typeof useAuth> | undefined;

      const TestContextValue = () => {
        contextValue = useAuth();
        return null;
      };

      render(
        <TestWrapper>
          <TestContextValue />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(contextValue).toBeDefined();
        expect(contextValue).toHaveProperty("user");
        expect(contextValue).toHaveProperty("session");
        expect(contextValue).toHaveProperty("loading");
        expect(contextValue).toHaveProperty("signUp");
        expect(contextValue).toHaveProperty("signIn");
        expect(contextValue).toHaveProperty("signOut");
        expect(typeof contextValue?.signUp).toBe("function");
        expect(typeof contextValue?.signIn).toBe("function");
        expect(typeof contextValue?.signOut).toBe("function");
      });
    });
  });
});

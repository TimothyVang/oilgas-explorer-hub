import { describe, it, expect } from "vitest";
import {
  getFriendlyError,
  getUserMessage,
  getFullUserMessage,
  isNetworkError,
  isAuthError,
  isRetryableError,
} from "@/lib/errorMessages";

describe("errorMessages", () => {
  describe("getFriendlyError", () => {
    describe("Authentication errors", () => {
      it("handles invalid login credentials", () => {
        const result = getFriendlyError({ message: "Invalid login credentials" });
        expect(result.category).toBe("auth");
        expect(result.message).toContain("Invalid email or password");
      });

      it("handles email not confirmed", () => {
        const result = getFriendlyError({ message: "Email not confirmed" });
        expect(result.category).toBe("auth");
        expect(result.message).toContain("verify your email");
      });

      it("handles already registered", () => {
        const result = getFriendlyError({ message: "User already registered" });
        expect(result.category).toBe("auth");
        expect(result.message).toContain("already exists");
      });

      it("handles token expired", () => {
        const result = getFriendlyError({ message: "JWT token expired" });
        expect(result.category).toBe("auth");
        expect(result.message).toContain("session has expired");
      });

      it("handles refresh_token_not_found", () => {
        const result = getFriendlyError({ message: "refresh_token_not_found" });
        expect(result.category).toBe("auth");
        expect(result.message).toContain("session has expired");
      });
    });

    describe("Network errors", () => {
      it("handles fetch errors", () => {
        const result = getFriendlyError(new TypeError("Failed to fetch"));
        expect(result.category).toBe("network");
        expect(result.message).toContain("Unable to connect");
      });

      it("handles network errors", () => {
        const result = getFriendlyError({ message: "Network request failed" });
        expect(result.category).toBe("network");
      });

      it("handles timeout errors", () => {
        const result = getFriendlyError({ message: "Request timeout" });
        expect(result.category).toBe("network");
        expect(result.message).toContain("took too long");
      });

      it("handles offline errors", () => {
        const result = getFriendlyError({ message: "User is offline" });
        expect(result.category).toBe("network");
        expect(result.message).toContain("offline");
      });
    });

    describe("Permission errors", () => {
      it("handles permission denied", () => {
        const result = getFriendlyError({ message: "Permission denied" });
        expect(result.category).toBe("permission");
        expect(result.message).toContain("don't have permission");
      });

      it("handles 403 forbidden", () => {
        const result = getFriendlyError({ status: 403, message: "Forbidden" });
        expect(result.category).toBe("permission");
      });

      it("handles unauthorized", () => {
        const result = getFriendlyError({ message: "Unauthorized" });
        expect(result.category).toBe("permission");
        expect(result.message).toContain("sign in");
      });
    });

    describe("Server errors", () => {
      it("handles 500 errors", () => {
        const result = getFriendlyError({ message: "Internal Server Error 500" });
        expect(result.category).toBe("server");
        expect(result.message).toContain("went wrong on our end");
      });

      it("handles 503 service unavailable", () => {
        const result = getFriendlyError({ message: "503 Service Unavailable" });
        expect(result.category).toBe("server");
        expect(result.message).toContain("temporarily unavailable");
      });

      it("handles rate limiting", () => {
        const result = getFriendlyError({ message: "429 Too Many Requests" });
        expect(result.category).toBe("server");
        expect(result.message).toContain("Too many requests");
      });
    });

    describe("Validation errors", () => {
      it("handles invalid email", () => {
        const result = getFriendlyError({ message: "Invalid email format" });
        expect(result.category).toBe("validation");
        expect(result.message).toContain("valid email");
      });

      it("handles required fields", () => {
        const result = getFriendlyError({ message: "Field is required" });
        expect(result.category).toBe("validation");
        expect(result.message).toContain("required fields");
      });

      it("handles duplicate errors", () => {
        const result = getFriendlyError({ message: "duplicate key value violates unique constraint" });
        expect(result.category).toBe("validation");
        expect(result.message).toContain("already exists");
      });
    });

    describe("Not found errors", () => {
      it("handles 404", () => {
        const result = getFriendlyError({ message: "404 Not Found" });
        expect(result.category).toBe("notFound");
      });

      it("handles Postgres not found", () => {
        const result = getFriendlyError({ code: "PGRST116" });
        expect(result.category).toBe("notFound");
      });
    });

    describe("Edge cases", () => {
      it("handles null error", () => {
        const result = getFriendlyError(null);
        expect(result.category).toBe("unknown");
        expect(result.message).toContain("unexpected error");
      });

      it("handles undefined error", () => {
        const result = getFriendlyError(undefined);
        expect(result.category).toBe("unknown");
      });

      it("handles string error", () => {
        const result = getFriendlyError("Invalid login credentials");
        expect(result.category).toBe("auth");
      });

      it("handles Error object", () => {
        const result = getFriendlyError(new Error("Network failure"));
        expect(result.category).toBe("network");
      });

      it("returns default for unknown errors", () => {
        const result = getFriendlyError({ message: "Some random error xyz123" });
        expect(result.category).toBe("unknown");
        expect(result.message).toContain("unexpected error");
        expect(result.actionable).toBeDefined();
      });
    });
  });

  describe("getUserMessage", () => {
    it("returns just the message", () => {
      const message = getUserMessage({ message: "Invalid login credentials" });
      expect(message).toBe("Invalid email or password. Please try again.");
    });

    it("works with Error objects", () => {
      const message = getUserMessage(new Error("Network error"));
      expect(message).toContain("Unable to connect");
    });
  });

  describe("getFullUserMessage", () => {
    it("returns message with actionable hint", () => {
      const message = getFullUserMessage({ message: "Invalid login credentials" });
      expect(message).toContain("Invalid email or password");
      expect(message).toContain("Double-check your credentials");
    });

    it("returns just message if no actionable hint", () => {
      const message = getFullUserMessage({ message: "Some unknown error" });
      expect(message).toContain("unexpected error");
    });
  });

  describe("isNetworkError", () => {
    it("returns true for network errors", () => {
      expect(isNetworkError({ message: "Failed to fetch" })).toBe(true);
      expect(isNetworkError({ message: "Network error" })).toBe(true);
      expect(isNetworkError({ message: "Request timeout" })).toBe(true);
    });

    it("returns false for non-network errors", () => {
      expect(isNetworkError({ message: "Invalid login credentials" })).toBe(false);
      expect(isNetworkError({ message: "Permission denied" })).toBe(false);
    });
  });

  describe("isAuthError", () => {
    it("returns true for auth errors", () => {
      expect(isAuthError({ message: "Invalid login credentials" })).toBe(true);
      expect(isAuthError({ message: "Email not confirmed" })).toBe(true);
      expect(isAuthError({ message: "Token expired" })).toBe(true);
    });

    it("returns false for non-auth errors", () => {
      expect(isAuthError({ message: "Network error" })).toBe(false);
      expect(isAuthError({ message: "Some random error" })).toBe(false);
    });
  });

  describe("isRetryableError", () => {
    it("returns true for network errors", () => {
      expect(isRetryableError({ message: "Network error" })).toBe(true);
      expect(isRetryableError({ message: "Failed to fetch" })).toBe(true);
    });

    it("returns true for server errors", () => {
      expect(isRetryableError({ message: "500 Internal Server Error" })).toBe(true);
      expect(isRetryableError({ message: "503 Service Unavailable" })).toBe(true);
    });

    it("returns false for auth/validation errors", () => {
      expect(isRetryableError({ message: "Invalid login credentials" })).toBe(false);
      expect(isRetryableError({ message: "Permission denied" })).toBe(false);
    });
  });
});

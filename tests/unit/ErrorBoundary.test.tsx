import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "@/components/ErrorBoundary";

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};

// Mock window.location
const mockReload = vi.fn();
const mockHrefSetter = vi.fn();

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for these tests
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        reload: mockReload,
        href: "",
        set href(value: string) {
          mockHrefSetter(value);
        },
      },
      writable: true,
    });
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders fallback UI when a child component throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/We're sorry, but something unexpected happened/)
    ).toBeInTheDocument();
  });

  it("shows error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // In development, the error message should be visible
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('provides a "Go to Homepage" button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeButton = screen.getByRole("button", { name: /go to homepage/i });
    expect(homeButton).toBeInTheDocument();

    fireEvent.click(homeButton);
    expect(mockHrefSetter).toHaveBeenCalledWith("/");
  });

  it('provides a "Reload Page" button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole("button", { name: /reload page/i });
    expect(reloadButton).toBeInTheDocument();

    fireEvent.click(reloadButton);
    expect(mockReload).toHaveBeenCalled();
  });

  it("logs error to console", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("renders proper accessibility structure", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should have a heading
    expect(
      screen.getByRole("heading", { name: /something went wrong/i })
    ).toBeInTheDocument();

    // Should have buttons
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("catches errors from deeply nested components", () => {
    const DeepComponent = () => {
      throw new Error("Deep error");
    };

    const NestedStructure = () => (
      <div>
        <div>
          <div>
            <DeepComponent />
          </div>
        </div>
      </div>
    );

    render(
      <ErrorBoundary>
        <NestedStructure />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});

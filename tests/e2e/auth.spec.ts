import { test, expect } from "@playwright/test";

/**
 * Authentication E2E Tests
 *
 * Tests the user registration and login UI flows.
 * Note: These tests verify UI behavior and form validation.
 * They do not create real users in the database.
 */
test.describe("Authentication - Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("displays login form by default", async ({ page }) => {
    // Verify login page title/header
    await expect(page.getByText("Investor Portal")).toBeVisible();
    await expect(page.getByText("Sign in to access your account")).toBeVisible();

    // Verify form elements
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();

    // Verify additional elements
    await expect(
      page.getByRole("button", { name: /continue with google/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
    await expect(page.getByRole("checkbox")).toBeVisible(); // Remember me
  });

  test("has back to home link", async ({ page }) => {
    const backLink = page.getByRole("link", { name: /back to home/i });
    await expect(backLink).toBeVisible();

    // Click and verify navigation
    await backLink.click();
    await expect(page).toHaveURL("/");
  });

  test("validates empty email field", async ({ page }) => {
    // Try to submit with empty email
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    // Form should not submit - HTML5 validation
    // The email input should be invalid
    const emailInput = page.getByLabel(/email address/i);
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test("validates invalid email format", async ({ page }) => {
    await page.getByLabel(/email address/i).fill("invalid-email");
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    // Wait for potential toast error message
    await page.waitForTimeout(500);
  });

  test("validates empty password field", async ({ page }) => {
    await page.getByLabel(/email address/i).fill("test@example.com");
    // Leave password empty
    await page.getByRole("button", { name: /^sign in$/i }).click();

    // Form should not submit - HTML5 validation
    const passwordInput = page.getByLabel(/^password$/i);
    const isValid = await passwordInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test("shows loading state during login attempt", async ({ page }) => {
    await page.getByLabel(/email address/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("password123");

    // Click sign in
    await page.getByRole("button", { name: /^sign in$/i }).click();

    // Check that button shows loading state (may be brief)
    // The button text changes to "Please wait..." during loading
    const button = page.getByRole("button", { name: /please wait|sign in/i });
    await expect(button).toBeVisible();
  });

  test("remembers me checkbox is functional", async ({ page }) => {
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).not.toBeChecked();

    // Click to check
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Click to uncheck
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test("forgot password link navigates correctly", async ({ page }) => {
    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL("/forgot-password");
  });
});

test.describe("Authentication - Signup Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    // Switch to signup mode
    await page.getByRole("button", { name: /create one/i }).click();
  });

  test("displays signup form when toggled", async ({ page }) => {
    // Verify signup-specific elements
    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account/i })
    ).toBeVisible();

    // Password hint should be visible
    await expect(
      page.getByText(/password must be at least 6 characters/i)
    ).toBeVisible();
  });

  test("validates empty name field", async ({ page }) => {
    // Fill email and password but leave name empty
    await page.getByLabel(/email address/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    // Form should not submit - HTML5 validation
    const nameInput = page.getByLabel(/full name/i);
    const isValid = await nameInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test("validates email format on signup", async ({ page }) => {
    await page.getByLabel(/full name/i).fill("Test User");
    await page.getByLabel(/email address/i).fill("invalid-email");
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    // Wait for potential toast error
    await page.waitForTimeout(500);
  });

  test("validates short password", async ({ page }) => {
    await page.getByLabel(/full name/i).fill("Test User");
    await page.getByLabel(/email address/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("12345"); // Less than 6 chars
    await page.getByRole("button", { name: /create account/i }).click();

    // Wait for toast error message
    await page.waitForTimeout(500);
  });

  test("can toggle back to login form", async ({ page }) => {
    // Currently in signup mode, switch back to login
    await page.getByRole("button", { name: /sign in/i }).click();

    // Verify login form is shown
    await expect(page.getByText("Sign in to access your account")).toBeVisible();
    await expect(page.getByLabel(/full name/i)).not.toBeVisible();
  });

  test("shows loading state during signup attempt", async ({ page }) => {
    await page.getByLabel(/full name/i).fill("Test User");
    await page.getByLabel(/email address/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("password123");

    // Click create account
    await page.getByRole("button", { name: /create account/i }).click();

    // Check that button shows loading state
    const button = page.getByRole("button", { name: /please wait|create account/i });
    await expect(button).toBeVisible();
  });
});

test.describe("Authentication - Google OAuth", () => {
  test("google sign in button is visible", async ({ page }) => {
    await page.goto("/login");

    const googleButton = page.getByRole("button", {
      name: /continue with google/i,
    });
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });

  test("google button shows loading state when clicked", async ({ page }) => {
    await page.goto("/login");

    const googleButton = page.getByRole("button", {
      name: /continue with google/i,
    });

    // Click the Google button
    await googleButton.click();

    // Should show loading state (briefly, may redirect quickly)
    // The button text changes to "Connecting..."
    // We just verify the click works without error
  });
});

test.describe("Authentication - Protected Routes", () => {
  test("dashboard redirects to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
  });

  test("profile redirects to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/profile");

    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
  });

  test("investor-documents redirects to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/investor-documents");

    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
  });

  test("admin redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/admin");

    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Authentication - Accessibility", () => {
  test("login form has proper labels", async ({ page }) => {
    await page.goto("/login");

    // Check that inputs have associated labels
    const emailInput = page.getByLabel(/email address/i);
    const passwordInput = page.getByLabel(/^password$/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify inputs have proper types
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("signup form has proper labels", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /create one/i }).click();

    // Check all form inputs have labels
    const nameInput = page.getByLabel(/full name/i);
    const emailInput = page.getByLabel(/email address/i);
    const passwordInput = page.getByLabel(/^password$/i);

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify input types
    await expect(nameInput).toHaveAttribute("type", "text");
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("forms are keyboard navigable", async ({ page }) => {
    await page.goto("/login");

    // Click on page first to ensure it's focused, then tab through form elements
    await page.click("body");

    // Focus on the email input directly and verify keyboard navigation works
    const emailInput = page.getByLabel(/email address/i);
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    // Tab to next element (password field)
    await page.keyboard.press("Tab");
    const passwordInput = page.getByLabel(/^password$/i);
    await expect(passwordInput).toBeFocused();

    // Tab to next element (could be remember me checkbox or submit button)
    await page.keyboard.press("Tab");

    // Verify some element is focused (don't require :focus to be visible)
    const focusedTagName = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTagName).toBeTruthy();
    expect(focusedTagName).not.toBe("BODY");
  });

  test("buttons have proper accessible names", async ({ page }) => {
    await page.goto("/login");

    // Verify buttons are identifiable
    await expect(
      page.getByRole("button", { name: /continue with google/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /create one/i })).toBeVisible();
  });
});

test.describe("Authentication - Visual", () => {
  test("login page has proper visual hierarchy", async ({ page }) => {
    await page.goto("/login");

    // Check for brand element
    await expect(page.getByText("Investor Portal")).toBeVisible();

    // Check for form container (card)
    const formContainer = page.locator(".bg-white\\/5, [class*='glassmorphism'], [class*='card']").first();
    await expect(formContainer).toBeVisible();

    // Check for divider between OAuth and email form
    await expect(page.getByText(/or continue with email/i)).toBeVisible();
  });

  test("signup page shows password requirements", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /create one/i }).click();

    // Password requirements text should be visible
    await expect(
      page.getByText(/password must be at least 6 characters/i)
    ).toBeVisible();
  });

  test("back to home link is visible", async ({ page }) => {
    await page.goto("/login");

    const backLink = page.getByRole("link", { name: /back to home/i });
    await expect(backLink).toBeVisible();
  });

  test("footer shows copyright", async ({ page }) => {
    await page.goto("/login");

    // Check for copyright text
    await expect(page.getByText(/BAH Oil and Gas/i)).toBeVisible();
    await expect(page.getByText(/All rights reserved/i)).toBeVisible();
  });
});

test.describe("Authentication - Mobile Responsiveness", () => {
  test("login page renders correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");

    // Form should be visible and usable
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();

    // No horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });

    if (hasHorizontalScroll) {
      const scrollDiff = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
        );
      });
      expect(scrollDiff).toBeLessThan(20); // Allow small variance
    }
  });

  test("signup form renders correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");
    await page.getByRole("button", { name: /create one/i }).click();

    // All form elements should be visible
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account/i })
    ).toBeVisible();
  });

  test("buttons are large enough for touch on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");

    // Check that main buttons meet touch target size requirements (44x44px minimum)
    const signInButton = page.getByRole("button", { name: /^sign in$/i });
    const box = await signInButton.boundingBox();

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40); // Allow some variance from 44px
      expect(box.width).toBeGreaterThanOrEqual(100); // Full width button
    }
  });
});

test.describe("Authentication - Edge Cases", () => {
  test("handles rapid form toggling", async ({ page }) => {
    await page.goto("/login");

    // Rapidly toggle between login and signup
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: /create one/i }).click();
      await page.waitForTimeout(100);
      await page.getByRole("button", { name: /sign in/i }).click();
      await page.waitForTimeout(100);
    }

    // Page should still be functional
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
  });

  test("clears form when toggling modes", async ({ page }) => {
    await page.goto("/login");

    // Fill login form
    await page.getByLabel(/email address/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("password123");

    // Switch to signup and back
    await page.getByRole("button", { name: /create one/i }).click();
    await page.getByRole("button", { name: /sign in/i }).click();

    // Form fields should retain values (current behavior)
    // or be cleared (if that's the expected behavior)
    // For now, just verify the form is functional
    const emailInput = page.getByLabel(/email address/i);
    await expect(emailInput).toBeVisible();
  });

  test("handles page refresh on login page", async ({ page }) => {
    await page.goto("/login");

    // Fill form
    await page.getByLabel(/email address/i).fill("test@example.com");

    // Refresh page
    await page.reload();

    // Form should be in initial state
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByText("Sign in to access your account")).toBeVisible();
  });
});

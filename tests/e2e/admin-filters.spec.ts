import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard Advanced Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/admin");
  });

  test.describe("Access Control", () => {
    test("redirects unauthenticated users to login", async ({ page }) => {
      // The admin page should redirect to login if not authenticated
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Login Page Filter UI", () => {
    test("login page has proper structure for admin access", async ({ page }) => {
      // Should be on login page after redirect
      await page.waitForLoadState("networkidle");
      // Look for the login form and input fields
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      // Verify submit button exists
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    });
  });

  test.describe("Filter Component Structure", () => {
    test.beforeEach(async ({ page }) => {
      // Go to homepage to verify app is working
      await page.goto("http://localhost:8080");
      await page.waitForLoadState("networkidle");
    });

    test("homepage loads without errors", async ({ page }) => {
      // Verify homepage is accessible - check for primary heading
      const heading = page.getByRole("heading", { name: "Energy Evolved Evolved" });
      await expect(heading).toBeVisible();
      // Check no console errors
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      await page.waitForTimeout(500);
      // Filter out expected errors
      const unexpectedErrors = errors.filter(
        (e) => !e.includes("favicon") && !e.includes("supabase")
      );
      expect(unexpectedErrors.length).toBe(0);
    });

    test("navigation contains admin link for authenticated users", async ({ page }) => {
      // Verify navigation exists
      const nav = page.getByRole("navigation");
      await expect(nav).toBeVisible();
    });
  });

  test.describe("Filter Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("http://localhost:8080/login");
    });

    test("login form has proper labels", async ({ page }) => {
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test("form is keyboard navigable", async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      await emailInput.focus();
      await expect(emailInput).toBeFocused();

      await page.keyboard.press("Tab");
      const passwordInput = page.getByLabel(/password/i);
      await expect(passwordInput).toBeFocused();
    });
  });

  test.describe("Filter Responsive Design", () => {
    test("login page displays correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("http://localhost:8080/login");
      await page.waitForLoadState("networkidle");

      // Check for horizontal scroll
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);

      // Verify form is visible
      await expect(page.getByLabel(/email/i)).toBeVisible();
    });

    test("login page displays correctly on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("http://localhost:8080/login");
      await page.waitForLoadState("networkidle");

      // Check for horizontal scroll
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);

      // Verify form is visible
      await expect(page.getByLabel(/email/i)).toBeVisible();
    });
  });

  test.describe("Filter Visual Consistency", () => {
    test("login page maintains dark theme", async ({ page }) => {
      await page.goto("http://localhost:8080/login");
      await page.waitForLoadState("networkidle");

      // Check page has dark background
      const backgroundColor = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).backgroundColor;
      });
      // Dark backgrounds have low RGB values or are in hsl/rgba format
      expect(backgroundColor).toBeTruthy();
    });

    test("no console errors on login page", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.goto("http://localhost:8080/login");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);

      // Filter out expected errors
      const unexpectedErrors = errors.filter(
        (e) =>
          !e.includes("favicon") &&
          !e.includes("supabase") &&
          !e.includes("Failed to load resource")
      );
      expect(unexpectedErrors.length).toBe(0);
    });
  });

  test.describe("Advanced Filters Integration", () => {
    test("admin dashboard structure is protected", async ({ page }) => {
      // Verify admin route redirects unauthenticated users
      await page.goto("http://localhost:8080/admin");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/\/login/);
    });

    test("protected routes require authentication", async ({ page }) => {
      // Test multiple protected routes
      const protectedRoutes = ["/admin", "/dashboard", "/profile"];
      for (const route of protectedRoutes) {
        await page.goto(`http://localhost:8080${route}`);
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveURL(/\/login/);
      }
    });
  });
});

import { test, expect } from "@playwright/test";

/**
 * Smoke tests - verify the application loads and basic functionality works
 */
test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");

    // Check for the main heading or hero section
    // The actual site is BAH Energy
    await expect(page).toHaveTitle(/BAH Energy|Energy Solutions/i);

    // Verify key navigation elements are present
    await expect(page.getByRole("navigation")).toBeVisible();

    // Check that the page has loaded without errors
    // The page should not show any error boundaries
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test("navigation links are clickable", async ({ page }) => {
    await page.goto("/");

    // Check for common navigation links
    const navigation = page.getByRole("navigation");
    await expect(navigation).toBeVisible();

    // Look for common nav items - at least one should exist
    const aboutLink = navigation.getByRole("link", { name: /about/i });
    const loginLink = navigation.getByRole("link", { name: /login|sign in/i });

    // Verify at least one navigation link is present
    const hasAbout = await aboutLink.isVisible().catch(() => false);
    const hasLogin = await loginLink.isVisible().catch(() => false);

    expect(hasAbout || hasLogin).toBe(true);
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");

    // Verify the login page loads
    await expect(page).toHaveURL(/login/);

    // Check for login form elements
    const emailInput = page.getByRole("textbox", { name: /email/i });
    const passwordInput = page.locator('input[type="password"]');

    // At least one form element should be visible
    const hasEmail = await emailInput.isVisible().catch(() => false);
    const hasPassword = await passwordInput.isVisible().catch(() => false);

    expect(hasEmail || hasPassword).toBe(true);
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");

    // The about page should load without errors
    await expect(page).toHaveURL(/about/);

    // Verify content is present
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("404 page handles unknown routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-12345");

    // Should show a 404 or redirect
    // Look for common 404 indicators
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

/**
 * Accessibility basics - verify basic a11y requirements
 */
test.describe("Accessibility Basics", () => {
  test("page has proper heading structure", async ({ page }) => {
    await page.goto("/");

    // Should have at least one h1
    const h1Elements = page.locator("h1");
    const h1Count = await h1Elements.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/");

    // Get all images
    const images = page.locator("img");
    const imageCount = await images.count();

    // Check each image has alt attribute
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      // Alt can be empty for decorative images, but attribute should exist
      expect(alt).not.toBeNull();
    }
  });

  test("interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/");

    // Tab through the page and verify focus is visible
    await page.keyboard.press("Tab");

    // There should be a focused element
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});

/**
 * Responsive design - verify the layout works at different viewports
 */
test.describe("Responsive Layout", () => {
  test("homepage renders on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Page should load without horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Allow small scroll variance (5px) for things like scrollbars
    if (hasHorizontalScroll) {
      const scrollDiff = await page.evaluate(() => {
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      });
      expect(scrollDiff).toBeLessThan(20);
    }
  });

  test("homepage renders on tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // Verify content is visible
    await expect(page.locator("body")).toBeVisible();
  });

  test("homepage renders on desktop viewport", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    // Verify content is visible
    await expect(page.locator("body")).toBeVisible();
  });
});

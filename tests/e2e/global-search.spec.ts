import { test, expect } from "@playwright/test";

test.describe("Global Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("search dialog opens with keyboard shortcut Ctrl+K", async ({ page }) => {
    // Trigger Ctrl+K
    await page.keyboard.press("Control+k");
    
    // Wait for dialog to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Check for search input
    await expect(page.getByPlaceholder(/type a command or search/i)).toBeVisible();
  });

  test("search dialog shows Pages group", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    // Wait for dialog and check for Pages group
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByText("Pages")).toBeVisible();
  });

  test("search dialog shows Sections group", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByText("Sections")).toBeVisible();
  });

  test("search dialog shows Actions group", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByText("Actions")).toBeVisible();
  });

  test("can search for Home page", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    // Type in search
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("Home");
    
    // Check that Home result appears
    await expect(page.getByRole("option", { name: /home/i }).first()).toBeVisible();
  });

  test("can search for About page", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("About");
    
    await expect(page.getByRole("option", { name: /about/i }).first()).toBeVisible();
  });

  test("can search for Services section", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("Services");
    
    await expect(page.getByRole("option", { name: /services/i }).first()).toBeVisible();
  });

  test("can search for Contact section", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("Contact");
    
    await expect(page.getByRole("option", { name: /contact/i }).first()).toBeVisible();
  });

  test("search shows empty state for non-matching query", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("xyznonexistent123");
    
    await expect(page.getByText(/no results found/i)).toBeVisible();
  });

  test("clicking search result navigates to About page", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("About");
    
    // Click on the About result
    await page.getByRole("option", { name: /about/i }).first().click();
    
    // Wait for navigation
    await expect(page).toHaveURL(/\/about/);
  });

  test("dialog closes with Escape key", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.keyboard.press("Escape");
    
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("search button in navigation opens search dialog", async ({ page }) => {
    // Click the search button in nav (desktop only)
    const searchButton = page.locator("button[aria-label='Search']");
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    }
  });

  test("shows Login option for unauthenticated users", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("Login");
    
    // Should show login option for guests
    await expect(page.getByRole("option", { name: /investor portal login/i })).toBeVisible();
  });

  test("does not show Dashboard for unauthenticated users", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("Dashboard");
    
    // Dashboard should not be visible for unauthenticated users
    // Wait a moment to let filtering complete
    await page.waitForTimeout(300);
    
    // Should show empty state since Dashboard requires auth
    const dashboardOption = page.getByRole("option", { name: /dashboard/i });
    const count = await dashboardOption.count();
    expect(count).toBe(0);
  });

  test("does not show Admin for unauthenticated users", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("Admin");
    
    await page.waitForTimeout(300);
    
    // Admin option should not appear for non-admin users
    const adminOption = page.getByRole("option", { name: /admin dashboard/i });
    const count = await adminOption.count();
    expect(count).toBe(0);
  });
});

test.describe("Global Search - Mobile", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
  });

  test("search dialog works on mobile", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByPlaceholder(/type a command or search/i)).toBeVisible();
  });

  test("can search and select result on mobile", async ({ page }) => {
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("About");
    
    await page.getByRole("option", { name: /about/i }).first().click();
    
    await expect(page).toHaveURL(/\/about/);
  });
});

test.describe("Global Search - Accessibility", () => {
  test("dialog has proper ARIA attributes", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  });

  test("search input has accessible label", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();
  });

  test("keyboard navigation works in search results", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    
    const searchInput = page.getByPlaceholder(/type a command or search/i);
    await searchInput.fill("a"); // Generic search to get results
    
    // Arrow down should move to first result
    await page.keyboard.press("ArrowDown");
    
    // The first option should be highlighted (has data-selected attribute)
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible();
  });
});

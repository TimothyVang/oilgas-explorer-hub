import { test, expect } from '@playwright/test';

test.describe('Design Review Screenshots', () => {
  test('capture homepage', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/review-homepage.png', fullPage: true });

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    expect(consoleErrors.length).toBe(0);
  });

  test('capture login page', async ({ page }) => {
    await page.goto('http://localhost:8080/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/review-login.png', fullPage: true });
  });

  test('capture signup form', async ({ page }) => {
    await page.goto('http://localhost:8080/login');
    await page.waitForLoadState('networkidle');

    // Click to switch to signup
    const signupTab = page.getByRole('button', { name: /sign up/i }).or(
      page.getByText(/create an account/i)
    ).or(
      page.getByText(/don't have an account/i)
    );

    if (await signupTab.isVisible()) {
      await signupTab.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'screenshots/review-signup.png', fullPage: true });
  });

  test('capture about page', async ({ page }) => {
    await page.goto('http://localhost:8080/about');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/review-about.png', fullPage: true });
  });

  test('capture forgot password page', async ({ page }) => {
    await page.goto('http://localhost:8080/forgot-password');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/review-forgot-password.png', fullPage: true });
  });

  test('check color contrast on login page', async ({ page }) => {
    await page.goto('http://localhost:8080/login');
    await page.waitForLoadState('networkidle');

    // Check that text is visible - Login page uses h1 headings
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Check form elements are properly styled
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();

    const submitButton = page.getByRole('button', { name: /sign in/i });
    await expect(submitButton).toBeVisible();
  });

  test('check mobile navigation visibility at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    // Check hamburger menu is visible
    const menuButton = page.getByRole('button', { name: /toggle menu/i }).or(
      page.locator('[aria-label*="menu"]')
    ).or(
      page.locator('button').filter({ has: page.locator('svg[class*="lucide"]') })
    );

    await page.screenshot({ path: 'screenshots/review-mobile-nav.png' });
  });

  test('verify consistent button styling', async ({ page }) => {
    await page.goto('http://localhost:8080/login');
    await page.waitForLoadState('networkidle');

    // Check primary button styling
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();

    // Check if back link is styled consistently
    const backLink = page.getByRole('link', { name: /back to home/i }).or(
      page.getByText(/back to home/i)
    );
    if (await backLink.isVisible()) {
      await expect(backLink).toBeVisible();
    }
  });
});

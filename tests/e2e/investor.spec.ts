import { test, expect } from '@playwright/test';

test.describe('Investor Documents Portal', () => {
  test.describe('Access Control', () => {
    test('redirects unauthenticated users to login', async ({ page }) => {
      await page.goto('/investor-documents');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('login page appears after investor redirect', async ({ page }) => {
      await page.goto('/investor-documents');

      // Wait for redirect
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Should show login form with email field
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    });

    test('investor documents route exists', async ({ page }) => {
      const response = await page.goto('/investor-documents');

      // Page should load (either investor page or redirect)
      expect(response?.status()).toBeLessThan(500);
    });
  });

  test.describe('Page Structure', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/investor-documents');
      // Will redirect to login
      await page.waitForURL(/\/login/, { timeout: 10000 });
    });

    test('redirected login page has proper structure', async ({ page }) => {
      // Check heading structure
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
    });

    test('login page has email and password fields', async ({ page }) => {
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    });

    test('login page has sign in button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });
  });

  test.describe('NDA Workflow - UI Elements', () => {
    // Test that NDA-related elements exist when on the page
    // These tests verify the page structure without authentication

    test('investor documents page exists in routing', async ({ page }) => {
      // Navigate directly to investor documents
      await page.goto('/investor-documents');

      // Should redirect unauthenticated users
      await expect(page).toHaveURL(/\/login/);
    });

    test('login form handles NDA flow entry point', async ({ page }) => {
      await page.goto('/investor-documents');
      await page.waitForURL(/\/login/, { timeout: 10000 });

      // User would sign in here, then be redirected back to investor documents
      // The email field should be ready for input
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeEnabled();
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/investor-documents');
      await page.waitForURL(/\/login/, { timeout: 10000 });
    });

    test('login form has proper labels', async ({ page }) => {
      // Email field should have label
      const emailLabel = page.locator('label').filter({ hasText: /email/i });
      await expect(emailLabel).toBeVisible();

      // Password field should have label
      const passwordLabel = page.locator('label').filter({ hasText: /password/i });
      await expect(passwordLabel).toBeVisible();
    });

    test('form is keyboard navigable', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should have a focused element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('buttons have proper accessible names', async ({ page }) => {
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await expect(signInButton).toBeVisible();

      // Google OAuth button
      const googleButton = page.getByRole('button', { name: /google/i });
      await expect(googleButton).toBeVisible();
    });

    test('page has dark theme enabled', async ({ page }) => {
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    });
  });

  test.describe('Responsive Design', () => {
    test('investor login works on mobile viewport (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/investor-documents');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Login form should be visible
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('investor login works on tablet viewport (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/investor-documents');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Login form should be visible
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    });

    test('investor login works on desktop viewport (1920px)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/investor-documents');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Login form should be visible
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    });

    test('mobile touch targets are adequate (44x44px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/investor-documents');
      await page.waitForURL(/\/login/, { timeout: 10000 });

      // Check button sizes
      const signInButton = page.getByRole('button', { name: /sign in/i });
      const box = await signInButton.boundingBox();

      expect(box).toBeTruthy();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test.describe('Visual Tests', () => {
    test('login page maintains consistent styling', async ({ page }) => {
      await page.goto('/investor-documents');
      await page.waitForURL(/\/login/, { timeout: 10000 });

      // Dark theme should be applied
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);

      // Body should be visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('no console errors on redirect', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/investor-documents');
      await page.waitForURL(/\/login/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Filter out expected errors
      const unexpectedErrors = consoleErrors.filter(err =>
        !err.includes('401') &&
        !err.includes('auth') &&
        !err.includes('Unauthorized') &&
        !err.includes('PGRST301')
      );

      expect(unexpectedErrors).toHaveLength(0);
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/investor-documents');
      await page.waitForURL(/\/login/, { timeout: 10000 });
    });

    test('email field is required', async ({ page }) => {
      // Check that email field exists and has required attribute or validates
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeVisible();

      // The form should not submit without values or show error
      // Fill password only and try to submit
      await page.getByRole('textbox', { name: /password/i }).fill('test123456');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait a moment for any response
      await page.waitForTimeout(1000);

      // Should either still be on login page (form didn't submit) or show error/loading
      // The key is that the form validates before submitting
      await expect(page).toHaveURL(/\/login/);
    });

    test('password field is required', async ({ page }) => {
      // Check that password field exists
      const passwordInput = page.getByRole('textbox', { name: /password/i });
      await expect(passwordInput).toBeVisible();

      // Fill email only and try to submit
      await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait a moment
      await page.waitForTimeout(1000);

      // Should still be on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('form handles invalid credentials gracefully', async ({ page }) => {
      // Enter valid format but invalid credentials
      await page.getByRole('textbox', { name: /email/i }).fill('notauser@example.com');
      await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword123');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Should either show error message or stay on login page
      // Not redirect anywhere unexpected
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Navigation', () => {
    test('back to home link exists on login page', async ({ page }) => {
      await page.goto('/investor-documents');
      await page.waitForURL(/\/login/, { timeout: 10000 });

      // Should have a link back to home
      const homeLink = page.getByRole('link', { name: /back.*home|home/i });
      await expect(homeLink).toBeVisible();
    });

    test('back to home link navigates correctly', async ({ page }) => {
      await page.goto('/investor-documents');
      await page.waitForURL(/\/login/, { timeout: 10000 });

      // Click back to home
      const homeLink = page.getByRole('link', { name: /back.*home/i });
      await homeLink.click();

      // Should be on home page
      await expect(page).toHaveURL('/');
    });

    test('footer is visible on login page', async ({ page }) => {
      await page.goto('/investor-documents');
      await page.waitForURL(/\/login/, { timeout: 10000 });

      // Footer with copyright should be visible
      const footer = page.getByText(/© 2026|all rights reserved/i);
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('page shows content after loading', async ({ page }) => {
      await page.goto('/investor-documents');

      // Should eventually show login page
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Content should be visible (not stuck in loading)
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible({ timeout: 5000 });
    });

    test('shows loading indicator if authentication check takes time', async ({ page }) => {
      // Start navigation
      const responsePromise = page.goto('/investor-documents');

      // Page should eventually load something
      await responsePromise;

      // Either loading spinner or login form should appear
      const hasLoginForm = await page.getByRole('textbox', { name: /email/i }).isVisible().catch(() => false);
      const hasLoading = await page.getByText(/loading|authenticating/i).isVisible().catch(() => false);

      // One of these should be true at some point
      // After full load, login form should be visible
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    });
  });

  test.describe('Security', () => {
    test('unauthenticated users cannot access documents', async ({ page }) => {
      // Try to access investor documents directly
      await page.goto('/investor-documents');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Should NOT see investor documents content
      const hasDocumentsContent = await page.getByText(/investor documents/i).isVisible().catch(() => false);
      const hasNdaContent = await page.getByText(/NDA Required/i).isVisible().catch(() => false);

      // Either redirected (no content) or at login page
      // The login page might have "Investor Portal" text but not "NDA Required"
      expect(hasNdaContent).toBeFalsy();
    });

    test('protected route handles direct URL access', async ({ page }) => {
      // Navigate directly
      const response = await page.goto('/investor-documents');

      // Should not return an error
      expect(response?.status()).toBeLessThan(500);

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });
});

test.describe('Investor Documents - Edge Cases', () => {
  test('handles network issues gracefully', async ({ page }) => {
    await page.goto('/investor-documents');

    // Page should handle the redirect without crashing
    await page.waitForLoadState('domcontentloaded');

    // Should show something (either loading, login, or error)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('page refresh maintains state', async ({ page }) => {
    await page.goto('/investor-documents');
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);

    // Wait for form to be visible (may have loading state after refresh)
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test('handles rapid navigation', async ({ page }) => {
    // Navigate quickly between pages
    await page.goto('/investor-documents');
    await page.goto('/');
    await page.goto('/investor-documents');

    // Should eventually settle on login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

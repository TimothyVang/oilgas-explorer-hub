#!/usr/bin/env python3
"""
Setup Checklist for Oil & Gas Explorer Hub - Production Enhancement

This script initializes the project checklist based on app_spec.txt.
Run this once at the start of the project to create the task tracking system.

Usage:
    python setup_checklist.py
"""

from pathlib import Path
from checklist_manager import ChecklistManager


def main():
    project_dir = Path(__file__).parent
    manager = ChecklistManager(project_dir)

    # Define phases based on app_spec.txt
    phases = [
        {
            "id": 1,
            "name": "Phase 1: Critical Infrastructure",
            "priority": "CRITICAL",
            "description": "Must complete before other phases. Install dependencies and verify environment."
        },
        {
            "id": 2,
            "name": "Phase 2: Comprehensive Testing",
            "priority": "HIGH",
            "description": "Set up testing infrastructure with Vitest and Playwright."
        },
        {
            "id": 3,
            "name": "Phase 3: Error Handling & Resilience",
            "priority": "HIGH",
            "description": "Implement error boundaries, loading states, and offline handling."
        },
        {
            "id": 4,
            "name": "Phase 4: Mobile Responsiveness",
            "priority": "HIGH",
            "description": "Test and fix mobile layouts at 375px, 768px, and 1920px."
        },
        {
            "id": 5,
            "name": "Phase 5: UI/UX Polish",
            "priority": "MEDIUM",
            "description": "Accessibility audit, design consistency, and performance optimization."
        },
        {
            "id": 6,
            "name": "Phase 6: New Features",
            "priority": "MEDIUM",
            "description": "Implement search, versioning, 2FA, audit trails, and reporting."
        }
    ]

    # Define tasks based on app_spec.txt
    tasks = [
        # Phase 1: Critical Infrastructure (BLOCKING)
        {
            "title": "Install npm dependencies",
            "description": "Run `npm install` in project root. Verify node_modules is created.",
            "priority": "CRITICAL",
            "phase": 1,
            "verification": "`npm run dev` starts successfully on port 8080",
            "files": ["package.json", "package-lock.json"]
        },
        {
            "title": "Verify development server starts",
            "description": "Confirm `npm run dev` starts without errors on http://localhost:8080",
            "priority": "CRITICAL",
            "phase": 1,
            "dependencies": [1],
            "verification": "Open browser, check console for zero errors"
        },
        {
            "title": "Run ESLint and fix critical errors",
            "description": "Execute `npm run lint`, fix any blocking compilation errors",
            "priority": "CRITICAL",
            "phase": 1,
            "dependencies": [1],
            "verification": "ESLint passes or only minor warnings remain",
            "files": ["eslint.config.js"]
        },
        {
            "title": "Configure production email service",
            "description": "Replace 'onboarding@resend.dev' with actual company email domain",
            "priority": "CRITICAL",
            "phase": 1,
            "verification": "Email templates updated, RESEND_API_KEY documented",
            "files": ["supabase/functions/send-email/index.ts"]
        },
        {
            "title": "Configure production DocuSign environment",
            "description": "Replace demo DocuSign URL with production environment",
            "priority": "CRITICAL",
            "phase": 1,
            "verification": "Production PowerForm URL configured, webhook tested",
            "files": ["src/pages/InvestorDocuments.tsx", "supabase/functions/docusign-webhook/index.ts"]
        },
        {
            "title": "Update company configuration",
            "description": "Replace placeholder company info (phone, address, social media) in Contact and Footer components",
            "priority": "CRITICAL",
            "phase": 1,
            "verification": "No placeholder text visible, all links working",
            "files": ["src/components/Contact.tsx", "src/components/Footer.tsx"]
        },
        {
            "title": "Create .env.production.example file",
            "description": "Document all required production environment variables with descriptions",
            "priority": "CRITICAL",
            "phase": 1,
            "verification": ".env.production.example created with full documentation",
            "files": [".env.production.example"]
        },
        {
            "title": "Verify production build succeeds",
            "description": "Run `npm run build`, ensure no build errors",
            "priority": "CRITICAL",
            "phase": 1,
            "dependencies": [1, 2, 3],
            "verification": "Build completes, dist/ directory created, no errors"
        },

        # Phase 2: Comprehensive Testing
        {
            "title": "Set up Vitest test environment",
            "description": "Install Vitest + React Testing Library, create vitest.config.ts, setup test utilities",
            "priority": "HIGH",
            "phase": 2,
            "verification": "`npm run test` command works",
            "files": ["vitest.config.ts", "tests/setup.ts", "package.json"]
        },
        {
            "title": "Create unit tests for AuthContext",
            "description": "Test signUp, signIn, signOut, session management functions",
            "priority": "HIGH",
            "phase": 2,
            "dependencies": [9],
            "verification": "All AuthContext tests passing",
            "files": ["tests/unit/AuthContext.test.tsx"]
        },
        {
            "title": "Create unit tests for utility functions",
            "description": "Test cn(), logActivity, and other helper functions in src/lib/",
            "priority": "HIGH",
            "phase": 2,
            "dependencies": [9],
            "verification": "All utility tests passing",
            "files": ["tests/unit/utils.test.ts", "tests/unit/logActivity.test.ts"]
        },
        {
            "title": "Create integration tests for auth flow",
            "description": "Test complete flow: signup -> email verify -> login -> dashboard",
            "priority": "HIGH",
            "phase": 2,
            "dependencies": [9],
            "verification": "Auth integration tests passing",
            "files": ["tests/integration/auth-flow.test.tsx"]
        },
        {
            "title": "Set up Playwright for E2E testing",
            "description": "Install Playwright, create playwright.config.ts, configure browsers",
            "priority": "HIGH",
            "phase": 2,
            "verification": "`npm run test:e2e` command works",
            "files": ["playwright.config.ts", "package.json"]
        },
        {
            "title": "Create E2E test - User registration and login",
            "description": "Playwright test for complete user signup and login flow",
            "priority": "HIGH",
            "phase": 2,
            "dependencies": [13],
            "verification": "E2E test passes, screenshots captured",
            "files": ["tests/e2e/auth.spec.ts"]
        },
        {
            "title": "Create E2E test - Admin dashboard workflows",
            "description": "Test admin user management and document management",
            "priority": "HIGH",
            "phase": 2,
            "dependencies": [13],
            "verification": "Admin E2E tests passing",
            "files": ["tests/e2e/admin.spec.ts"]
        },
        {
            "title": "Create E2E test - Investor portal",
            "description": "Test NDA signing workflow and document access",
            "priority": "HIGH",
            "phase": 2,
            "dependencies": [13],
            "verification": "Investor portal E2E tests passing",
            "files": ["tests/e2e/investor.spec.ts"]
        },
        {
            "title": "Create E2E test - Form validation",
            "description": "Test all forms with invalid data, verify error messages",
            "priority": "HIGH",
            "phase": 2,
            "dependencies": [13],
            "verification": "Form validation tests passing",
            "files": ["tests/e2e/forms.spec.ts"]
        },
        {
            "title": "Achieve 80%+ test coverage",
            "description": "Run coverage report, add tests for uncovered critical paths",
            "priority": "HIGH",
            "phase": 2,
            "dependencies": [10, 11, 14, 15, 16, 17],
            "verification": "Coverage report shows 80%+ on critical code"
        },

        # Phase 3: Error Handling & Resilience
        {
            "title": "Implement root error boundary",
            "description": "Wrap App with ErrorBoundary to catch all uncaught errors",
            "priority": "HIGH",
            "phase": 3,
            "verification": "Throw test error, verify fallback UI shown",
            "files": ["src/App.tsx", "src/components/ErrorBoundary.tsx"]
        },
        {
            "title": "Add loading states everywhere",
            "description": "Ensure every async operation shows loading spinner or skeleton",
            "priority": "HIGH",
            "phase": 3,
            "verification": "No flash of empty content during loading"
        },
        {
            "title": "Implement comprehensive form validation",
            "description": "Use Zod schemas for all forms, add user-friendly error messages",
            "priority": "HIGH",
            "phase": 3,
            "verification": "All forms show clear error messages for invalid input"
        },
        {
            "title": "Add retry logic for API failures",
            "description": "Implement exponential backoff for Supabase query failures",
            "priority": "HIGH",
            "phase": 3,
            "verification": "Cause API failure, verify retry happens automatically",
            "files": ["src/integrations/supabase/client.ts"]
        },
        {
            "title": "Add user-friendly error messages",
            "description": "Replace technical error messages with helpful user-facing text",
            "priority": "HIGH",
            "phase": 3,
            "verification": "Test various errors, verify messages are clear"
        },
        {
            "title": "Implement offline detection",
            "description": "Show banner when network is offline, queue operations",
            "priority": "HIGH",
            "phase": 3,
            "verification": "Disconnect network, verify offline banner appears",
            "files": ["src/components/OfflineBanner.tsx", "src/App.tsx"]
        },
        {
            "title": "Set up error logging (Sentry)",
            "description": "Configure Sentry or similar for production error tracking",
            "priority": "HIGH",
            "phase": 3,
            "verification": "Sentry dashboard receiving test errors",
            "files": ["src/main.tsx", ".env.production.example"]
        },

        # Phase 4: Mobile Responsiveness
        {
            "title": "Test all pages at mobile viewport (375px)",
            "description": "Use Playwright to test all pages at iPhone SE width",
            "priority": "HIGH",
            "phase": 4,
            "verification": "No horizontal scroll, all content readable",
            "files": ["tests/e2e/responsive.spec.ts"]
        },
        {
            "title": "Test all pages at tablet viewport (768px)",
            "description": "Test all pages at iPad width",
            "priority": "HIGH",
            "phase": 4,
            "dependencies": [26],
            "verification": "Layout appropriate for tablet"
        },
        {
            "title": "Fix navigation menu on mobile",
            "description": "Ensure hamburger menu works, proper touch targets",
            "priority": "HIGH",
            "phase": 4,
            "verification": "Navigation usable on mobile, touch targets >= 44x44px",
            "files": ["src/components/Navigation.tsx"]
        },
        {
            "title": "Fix admin tables on mobile",
            "description": "Make admin tables horizontally scrollable or stacked",
            "priority": "HIGH",
            "phase": 4,
            "verification": "Admin tables usable on mobile",
            "files": ["src/pages/AdminDashboard.tsx"]
        },
        {
            "title": "Fix document cards mobile layout",
            "description": "Ensure document cards stack properly, text readable",
            "priority": "HIGH",
            "phase": 4,
            "verification": "Document cards look good on mobile",
            "files": ["src/components/dashboard/DocumentsTab.tsx"]
        },
        {
            "title": "Test forms with mobile keyboards",
            "description": "Verify all forms work with mobile keyboards, proper input types",
            "priority": "HIGH",
            "phase": 4,
            "verification": "Forms usable on mobile, autocomplete works"
        },

        # Phase 5: UI/UX Polish
        {
            "title": "Run design review on all pages",
            "description": "Use `/review-design` command on each page to identify issues",
            "priority": "MEDIUM",
            "phase": 5,
            "verification": "Design review report generated with actionable items"
        },
        {
            "title": "Run accessibility audit",
            "description": "Use `/accessibility-audit --level AA` on all interactive components",
            "priority": "MEDIUM",
            "phase": 5,
            "verification": "WCAG 2.2 Level AA compliance report"
        },
        {
            "title": "Fix accessibility violations",
            "description": "Address all issues identified in accessibility audit",
            "priority": "MEDIUM",
            "phase": 5,
            "dependencies": [33],
            "verification": "Re-run audit, verify all critical issues resolved"
        },
        {
            "title": "Improve loading skeleton states",
            "description": "Replace simple spinners with content-shaped skeletons",
            "priority": "MEDIUM",
            "phase": 5,
            "verification": "Loading states feel smooth and professional"
        },
        {
            "title": "Add smooth transitions (Framer Motion)",
            "description": "Add page transitions, modal animations using Framer Motion",
            "priority": "MEDIUM",
            "phase": 5,
            "verification": "Animations smooth, no jank"
        },
        {
            "title": "Optimize and compress images",
            "description": "Convert images to WebP, add lazy loading",
            "priority": "MEDIUM",
            "phase": 5,
            "verification": "Images load fast, Lighthouse performance improved",
            "files": ["public/"]
        },
        {
            "title": "Verify color contrast ratios",
            "description": "Check all text meets WCAG 4.5:1, UI elements 3:1",
            "priority": "MEDIUM",
            "phase": 5,
            "verification": "Contrast checker passes all text/UI combinations",
            "files": ["tailwind.config.ts"]
        },

        # Phase 6: New Features
        {
            "title": "Implement global search",
            "description": "Add search bar to navigation, search documents/users/pages",
            "priority": "MEDIUM",
            "phase": 6,
            "verification": "Search works, results relevant",
            "files": ["src/components/GlobalSearch.tsx", "src/components/Navigation.tsx"]
        },
        {
            "title": "Add document versioning",
            "description": "Track document revisions, allow version uploads",
            "priority": "MEDIUM",
            "phase": 6,
            "verification": "Document version history visible, can upload new versions",
            "files": ["src/components/admin/DocumentVersioning.tsx"]
        },
        {
            "title": "Implement 2FA (TOTP)",
            "description": "Add TOTP 2FA support with QR codes and backup codes",
            "priority": "MEDIUM",
            "phase": 6,
            "verification": "Can enable 2FA, scan QR, verify code works",
            "files": ["src/components/TwoFactorSetup.tsx", "src/contexts/AuthContext.tsx"]
        },
        {
            "title": "Add comprehensive audit trails",
            "description": "Log all admin actions, document access, profile changes",
            "priority": "MEDIUM",
            "phase": 6,
            "verification": "Audit log shows all activities with timestamps",
            "files": ["src/components/admin/AuditTrail.tsx"]
        },
        {
            "title": "Implement advanced filtering (admin)",
            "description": "Add date range, status, role filters to admin tables",
            "priority": "MEDIUM",
            "phase": 6,
            "verification": "Filters work, results update in real-time",
            "files": ["src/components/admin/UserFilters.tsx"]
        },
        {
            "title": "Add bulk operations (admin)",
            "description": "Allow bulk delete, bulk role change, bulk email",
            "priority": "MEDIUM",
            "phase": 6,
            "verification": "Can select multiple users, perform bulk action",
            "files": ["src/components/admin/BulkActionsBar.tsx"]
        },
        {
            "title": "Create reporting dashboard",
            "description": "Add charts for user growth, document downloads, activity trends",
            "priority": "MEDIUM",
            "phase": 6,
            "verification": "Charts display data correctly, update in real-time",
            "files": ["src/pages/ReportingDashboard.tsx"]
        },
        {
            "title": "Add email notification preferences",
            "description": "Let users control which emails they receive",
            "priority": "MEDIUM",
            "phase": 6,
            "verification": "Preference settings work, emails respect preferences",
            "files": ["src/pages/Profile.tsx"]
        },
        {
            "title": "Implement session timeout with renewal",
            "description": "Auto-logout after inactivity, show renewal prompt before timeout",
            "priority": "MEDIUM",
            "phase": 6,
            "verification": "Session expires after inactivity, renewal prompt works",
            "files": ["src/contexts/AuthContext.tsx", "src/components/SessionTimeout.tsx"]
        }
    ]

    # Success criteria from app_spec.txt
    success_criteria = [
        "All existing features continue working",
        "Zero console errors/warnings",
        "Zero TypeScript errors",
        "ESLint passing",
        "80%+ test coverage",
        "All Playwright tests passing",
        "Production build succeeds",
        "Lighthouse score 90+",
        "WCAG 2.2 Level AA compliant",
        "Mobile responsive (375px, 768px, 1920px)",
        "Production email configured",
        "DocuSign production working",
        "Company info complete",
        ".env.production documented"
    ]

    # Initialize the checklist
    manager.initialize(
        project_name="Oil & Gas Explorer Hub - Production Enhancement",
        tasks=tasks,
        phases=phases,
        success_criteria=success_criteria
    )

    # Export to Markdown
    manager.export_to_markdown()

    # Print summary
    progress = manager.get_progress()
    print(f"\n{'='*60}")
    print(f"Checklist initialized!")
    print(f"{'='*60}")
    print(f"Project: Oil & Gas Explorer Hub - Production Enhancement")
    print(f"Total tasks: {progress['total']}")
    print(f"Phases: {len(phases)}")
    print(f"")
    print(f"Files created:")
    print(f"  - .project_checklist.json (task data)")
    print(f"  - CHECKLIST.md (human-readable)")
    print(f"")
    print(f"Next steps:")
    print(f"  1. Run `python checklist_manager.py` to see next task")
    print(f"  2. Update task status with manager.update_task_status()")
    print(f"  3. Export updates with manager.export_to_markdown()")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()

# Senior Website UI/UX Designer for 2026

A comprehensive Claude Code plugin providing senior-level UI/UX design review, accessibility auditing, responsive design validation, and performance optimization for modern React/TypeScript/Tailwind CSS projects.

## Features

- 🎨 **Comprehensive Design Review**: Analyze components for modern design patterns, visual hierarchy, and consistency
- ♿ **WCAG 2.2 Compliance**: Level AA/AAA accessibility validation with detailed remediation guidance
- 📱 **Responsive Design Validation**: Mobile-first pattern checking and multi-viewport testing
- ⚡ **Performance Optimization**: Animation analysis, image optimization, and Core Web Vitals monitoring
- 🤖 **Proactive Agents**: Real-time suggestions as you code
- 🔍 **Browser Testing**: Playwright integration for live accessibility and responsive testing

## Installation

### Quick Start

1. Copy this plugin directory to your project's `.claude/plugins/` folder:
```bash
cp -r senior-uiux-designer /path/to/your-project/.claude/plugins/
```

2. Restart Claude Code or reload plugins

3. Verify installation:
```bash
/help
```
You should see `senior-uiux-designer` commands and agents listed.

### Requirements

- **Claude Code**: Version 1.0.0 or higher
- **Node.js**: 16+ (for Playwright MCP)
- **Project Type**: React/TypeScript/Tailwind CSS (optimized for, but works with any web project)

### Optional: Playwright Browser Testing

For browser-based accessibility and responsive testing:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

## Available Commands

### `/review-design` - Comprehensive Design Review

Performs a detailed UI/UX analysis with specific line numbers and code examples.

```bash
# Review current file or recent changes
/review-design

# Review specific file
/review-design src/components/Hero.tsx

# Review directory
/review-design src/components/admin

# Focus on specific area
/review-design --focus accessibility
/review-design --focus performance
/review-design --focus responsive
/review-design --focus ui
```

**Output**:
- Executive summary with overall score
- Categorized issues (Critical/High/Medium/Low)
- Specific code snippets with fixes
- 2026 enhancement opportunities
- Positive highlights
- Next steps

**What It Checks**:
- **Design Patterns**: Design token usage, component consistency, visual hierarchy
- **Accessibility**: WCAG 2.2 compliance, ARIA, keyboard navigation, color contrast
- **Responsive**: Mobile-first patterns, touch targets, breakpoint usage
- **Performance**: Animation efficiency, image optimization, layout stability

---

### `/accessibility-audit` - Deep WCAG 2.2 Compliance Audit

Comprehensive accessibility testing with browser validation and compliance scoring.

```bash
# Audit current file
/accessibility-audit

# Audit specific component
/accessibility-audit src/components/LoginForm.tsx

# Audit live page with browser testing
/accessibility-audit http://localhost:5173 --browser true

# Check Level AAA compliance
/accessibility-audit --level AAA

# Static analysis only (faster)
/accessibility-audit src/components/admin --browser false
```

**Output**:
- WCAG 2.2 compliance percentage and grade
- Critical violations (Level A) - must fix
- High priority issues (Level AA) - should fix
- Medium priority (Level AAA) - recommended
- Keyboard navigation flow testing
- Color contrast matrix
- Screen reader experience simulation
- Remediation checklist with priorities

**What It Tests**:
- Static analysis: ARIA, semantic HTML, forms, images, contrast
- Browser testing: Live keyboard navigation, focus indicators, axe-core scans
- Compliance scoring: Level A, AA, or AAA certification

---

### `/responsive-check` - Multi-Viewport Responsive Validation

Tests responsive design across all breakpoints with mobile-first pattern checking.

```bash
# Check current file/page
/responsive-check

# Test specific component
/responsive-check src/components/Hero.tsx

# Test live page at multiple viewports
/responsive-check http://localhost:5173

# Custom viewports
/responsive-check --viewports "375,768,1920"

# Static analysis only
/responsive-check src/pages/Dashboard.tsx --browser false
```

**Output**:
- Screenshots at each viewport (Mobile, Tablet, Desktop, Large)
- Touch target size violations (WCAG 2.5.5)
- Mobile-first pattern analysis
- Breakpoint consistency checking
- Horizontal overflow detection
- Typography readability matrix
- Layout behavior summary
- Side-by-side viewport comparisons

**What It Tests**:
- Static analysis: Mobile-first patterns, breakpoint consistency, touch targets
- Browser testing: Live viewport screenshots, overflow detection, interactive element sizing
- Default viewports: 375px, 640px, 768px, 1024px, 1280px, 1920px

---

## Autonomous Agents

### Accessibility Watcher

**Triggers**: Automatically when you create/modify forms, interactive components, or navigation

**What It Does**:
- Monitors for missing form labels
- Checks ARIA attributes on modals and buttons
- Validates keyboard navigation
- Checks color contrast
- Ensures semantic HTML usage

**Example Output**:
```
♿ Accessibility Watcher Alert!

🚨 Critical: Form Input Missing Label

I noticed your email input doesn't have an associated label...

**Current Issue** (src/components/LoginForm.tsx:23):
<Input type="email" placeholder="Enter your email" />

**Required Fix**:
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />

**WCAG Reference**: 3.3.2 Labels or Instructions - Level A
```

---

### Design Guardian

**Triggers**: Automatically when you create/modify UI components

**What It Does**:
- Detects hardcoded colors and suggests design tokens
- Validates component pattern consistency
- Checks visual hierarchy (heading progression, typography)
- Monitors hover and focus states
- Suggests 2026 modern UI enhancements (glassmorphism, gradients)

**Example Output**:
```
🎨 Design Guardian Alert!

🚨 High: Hardcoded Color Instead of Design Token

I noticed you're using hardcoded blue #0066ff...

**Current Code** (src/components/Button.tsx:15):
<button className="bg-[#0066ff] text-white">

**Recommended Fix**:
<Button className="bg-primary text-primary-foreground">

**Why**: Design tokens ensure consistency and theme support

💡 Tip: Consider using variant="hero" for CTAs
```

---

## Knowledge Base (Skills)

The plugin includes 6 comprehensive knowledge modules:

1. **accessibility-standards.md**: WCAG 2.2 AA/AAA requirements, ARIA patterns, keyboard navigation
2. **modern-ui-patterns-2026.md**: 2026 design trends, micro-interactions, component patterns
3. **responsive-design-best-practices.md**: Mobile-first, breakpoints, touch targets
4. **performance-optimization.md**: Animation performance, Core Web Vitals, bundle size
5. **tailwind-shadcn-patterns.md**: Project-specific design system patterns
6. **wcag-compliance-guide.md**: Practical WCAG checklist and remediation guide

Commands and agents reference these skills for consistent, comprehensive analysis.

---

## Configuration

### Plugin Settings (plugin.json)

```json
{
  "settings": {
    "feedbackStyle": "detailed",        // "concise" | "detailed"
    "includeLineNumbers": true,         // Include line numbers in reports
    "includeCodeExamples": true,        // Include code snippets
    "browserTesting": true,             // Enable Playwright integration
    "strictMode": false                 // Strict WCAG AAA compliance
  }
}
```

### Playwright Configuration (mcp/playwright.mcp.json)

Browser testing is configured for:
- **Browser**: Chromium (headless)
- **Viewports**: Mobile (375px), Tablet (768px), Desktop (1280px, 1920px)
- **Base URL**: http://localhost:5173 (Vite default)
- **Timeout**: 30 seconds

**Update Base URL** for your dev server:
```json
{
  "playwright": {
    "baseURL": "http://localhost:3000"  // Update for your project
  }
}
```

---

## Usage Examples

### Daily Workflow

1. **While Coding**: Accessibility Watcher provides real-time feedback
```tsx
// You create a form
<Input placeholder="Email" />

// Accessibility Watcher alerts you
♿ Missing form label detected!
```

2. **Before Committing**: Run design review
```bash
/review-design src/components/NewFeature.tsx
```

3. **Deep Audits**: When needed
```bash
/accessibility-audit --browser true
/responsive-check --browser true
/performance-scan
```

### Example: Reviewing Admin Dashboard

```bash
/review-design src/components/admin --focus all
```

**Output**:
- Checks all 10+ admin components
- Identifies design inconsistencies
- Flags accessibility issues
- Validates responsive patterns
- Suggests performance optimizations

---

## Extending the Plugin

### Adding More Commands

The comprehensive implementation plan includes specifications for:
- `/accessibility-audit` - Deep WCAG audit with browser testing
- `/responsive-check` - Multi-viewport validation
- `/performance-scan` - Frontend performance analysis

Refer to `C:\Users\newbi\.claude\plans\binary-gliding-blum.md` for detailed specifications.

### Adding More Agents

Planned agents:
- **design-guardian**: Design consistency monitoring
- **performance-monitor**: Performance optimization suggestions

### Adding Hooks

Planned hooks:
- **pre-commit-design-check**: Catch issues before commits
- **post-file-change-review**: Route to appropriate agent after edits

---

## Troubleshooting

### Commands Not Showing Up

1. Check plugin is in correct location: `.claude/plugins/senior-uiux-designer/`
2. Verify `plugin.json` exists and is valid JSON
3. Restart Claude Code
4. Run `/help` to see all available commands

### Accessibility Watcher Not Triggering

The agent triggers when you:
- Create/modify `.tsx` or `.jsx` files with forms or interactive components
- Add buttons, modals, dialogs, or navigation

If not triggering, check the `whenToUse` description in `agents/accessibility-watcher.md`.

### Browser Testing Not Working

1. Ensure Playwright is installed:
```bash
npm install -D @playwright/test
npx playwright install chromium
```

2. Check `mcp/playwright.mcp.json` has correct `baseURL`

3. Ensure dev server is running before testing

---

## Roadmap

### Implemented ✅
- ✅ Plugin foundation (manifest, MCP configuration)
- ✅ 6 comprehensive knowledge skills
- ✅ `/review-design` command (comprehensive design review)
- ✅ `/accessibility-audit` command (WCAG 2.2 compliance testing)
- ✅ `/responsive-check` command (multi-viewport validation)
- ✅ Accessibility Watcher agent (proactive WCAG monitoring)
- ✅ Design Guardian agent (design consistency monitoring)

### Planned 🚧
- `/performance-scan` with Core Web Vitals
- Performance Monitor agent
- Pre-commit design check hook
- Post-file-change review hook

See the full implementation plan at `C:\Users\newbi\.claude\plans\binary-gliding-blum.md`.

---

## Contributing

This plugin is tailored for the BAH Energy website (React + TypeScript + Tailwind + shadcn-ui) but can be adapted for any modern web project.

### Customizing for Your Project

1. **Update Design System** (`skills/tailwind-shadcn-patterns.md`):
   - Replace color tokens with your brand colors
   - Update typography system
   - Customize animation keyframes

2. **Adjust Breakpoints** (`skills/responsive-design-best-practices.md`):
   - Update viewport sizes if different
   - Modify responsive patterns

3. **Configure Playwright** (`mcp/playwright.mcp.json`):
   - Change `baseURL` to your dev server
   - Adjust viewport sizes
   - Update browser preferences

---

## License

This plugin is part of the Claude Code community plugin ecosystem.

---

## Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Review the implementation plan: `C:\Users\newbi\.claude\plans\binary-gliding-blum.md`
3. Examine the knowledge skills for detailed guidance

---

## Credits

Built for senior-level UI/UX design review with focus on:
- Modern 2026 design standards
- WCAG 2.2 Level AA/AAA compliance
- Mobile-first responsive design
- 60fps animation performance
- Core Web Vitals optimization

Optimized for React + TypeScript + Tailwind CSS + shadcn-ui projects.

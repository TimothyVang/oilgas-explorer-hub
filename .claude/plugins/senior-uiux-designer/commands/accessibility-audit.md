---
name: accessibility-audit
description: Deep WCAG 2.2 accessibility audit with browser testing and compliance scoring
arguments:
  - name: target
    description: File path, directory, or URL to audit (defaults to current file)
    type: string
    required: false
  - name: level
    description: WCAG conformance level - AA or AAA (default AA)
    type: string
    default: AA
    required: false
  - name: browser
    description: Run live browser tests with Playwright (default true)
    type: boolean
    default: true
    required: false
examples:
  - /accessibility-audit
  - /accessibility-audit src/components/LoginForm.tsx
  - /accessibility-audit http://localhost:5173 --level AAA
  - /accessibility-audit src/components/admin --browser false
---

Perform a comprehensive WCAG 2.2 accessibility audit with detailed compliance scoring, browser testing, and remediation guidance.

## Implementation Steps

### 1. Identify Target

If `target` is a URL:
- Use for browser testing only
- Skip static file analysis

If `target` is a file/directory:
- Use Glob to find `.tsx`, `.jsx` files
- Perform both static and browser testing

If no `target`:
- Use current file or recently changed files

### 2. Static Analysis (File-Based)

Reference: **accessibility-standards.md** and **wcag-compliance-guide.md** skills

#### A. Semantic HTML Validation (WCAG 1.3.1 - Level A)

**Check for:**
- Use Grep to find improper element usage:
  - `<div.*onClick` → Should be `<button>`
  - `<span.*onClick` → Should be `<button>`
  - Missing `<main>`, `<nav>`, `<article>` landmarks
- Validate heading hierarchy (h1 → h2 → h3, no skips)

**Report Format:**
```
❌ WCAG 1.3.1 - Info and Relationships (Level A) - FAIL
Found {count} div/span elements with onClick handlers that should be buttons
Line {X}: <div onClick={...}> → Use <button>
```

#### B. ARIA Attribute Validation (WCAG 4.1.2 - Level A)

**Check for:**
- Icon-only buttons missing `aria-label`
- Dialogs missing `role="dialog"`, `aria-labelledby`, `aria-describedby`
- Disclosure buttons missing `aria-expanded`, `aria-controls`
- Dynamic content missing `aria-live` regions
- Invalid ARIA usage (wrong roles, states, properties)

**Pattern Matching:**
```bash
# Icon-only buttons
grep -n '<[Bb]utton[^>]*>[\s]*<[A-Z]' {file}

# Check for aria-label or visible text
grep -n 'aria-label\|aria-labelledby' {file}

# Find dialogs
grep -n 'Dialog\|Modal' {file}
```

**Report Format:**
```
❌ WCAG 4.1.2 - Name, Role, Value (Level A) - FAIL
Line 45: Icon button missing accessible name
  <Button><Settings /></Button>
Fix: <Button aria-label="Open settings"><Settings /></Button>
```

#### C. Form Accessibility (WCAG 3.3.2 - Level A)

**Check for:**
- Inputs without associated labels
- Required fields without `required` attribute or visual indicator
- Error messages not associated with fields (`aria-describedby`)
- Submit buttons not clearly labeled

**Pattern Matching:**
```bash
# Find inputs
grep -n '<Input\|<input' {file}

# Check for labels
grep -n '<Label\|<label' {file}
grep -n 'htmlFor=\|aria-label=' {file}
```

**Report Format:**
```
❌ WCAG 3.3.2 - Labels or Instructions (Level A) - FAIL
Line 23: Input without associated label
  <Input placeholder="Email" />
Fix:
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" placeholder="you@example.com" />
```

#### D. Image Alt Text (WCAG 1.1.1 - Level A)

**Check for:**
- Images without `alt` attribute
- Empty alt on meaningful images
- Alt text quality (not "image" or "picture")

**Pattern Matching:**
```bash
# Find all images
grep -n '<img' {file}

# Check for alt attribute
grep -n 'alt=' {file}
```

**Report Format:**
```
❌ WCAG 1.1.1 - Non-text Content (Level A) - FAIL
Line 67: Image missing alt text
  <img src="/hero.jpg" />
Fix: <img src="/hero.jpg" alt="Oil pump jacks at sunset in energy field" />
```

#### E. Color Contrast Analysis (WCAG 1.4.3 - Level AA, 1.4.6 - Level AAA)

**Process:**
1. Parse all Tailwind color classes
2. Extract foreground/background pairs
3. Map to HSL values from tailwind.config.ts
4. Calculate contrast ratios
5. Check against WCAG standards:
   - AA: 4.5:1 normal text, 3.0:1 large text
   - AAA: 7.0:1 normal text, 4.5:1 large text

**Report Format:**
```
⚠️ WCAG 1.4.3 - Contrast (Minimum) - Level AA - FAIL
Line 89: Insufficient contrast ratio
  text-gray-400 on bg-white: 2.8:1 (Required: 4.5:1)
Fix: Use text-gray-700 (5.7:1 contrast) or text-foreground
```

#### F. Keyboard Navigation (WCAG 2.1.1 - Level A)

**Check for:**
- Custom interactive elements without `tabIndex`
- Focus indicators removed (`focus:outline-none` without alternative)
- Keyboard traps (rare in static analysis)

**Pattern Matching:**
```bash
# Find focus:outline-none
grep -n 'focus:outline-none' {file}

# Check for alternative focus styles
grep -n 'focus-visible:ring\|focus:ring' {file}
```

**Report Format:**
```
⚠️ WCAG 2.4.7 - Focus Visible (Level AA) - FAIL
Line 102: Focus indicator removed without alternative
  <Button className="focus:outline-none">
Fix: <Button className="focus-visible:ring-2 focus-visible:ring-ring">
```

### 3. Browser Testing (if browser=true)

Reference: **Playwright MCP** configuration in `mcp/playwright.mcp.json`

#### A. Setup and Navigation

```
1. Check if dev server is running (http://localhost:5173)
2. Use browser_navigate to load the page/component
3. Take initial accessibility snapshot with browser_snapshot
```

#### B. Automated Accessibility Scan (axe-core)

```javascript
// Run axe-core accessibility tests
const violations = await browser_evaluate({
  function: `() => {
    return axe.run().then(results => ({
      violations: results.violations,
      passes: results.passes.length,
      incomplete: results.incomplete
    }));
  }`
});

// Process violations by severity
violations.forEach(violation => {
  // Critical: WCAG A failures
  // High: WCAG AA failures
  // Medium: WCAG AAA failures
});
```

#### C. Keyboard Navigation Testing

```
1. Press Tab key to move through all focusable elements
2. For each element:
   - Verify focus indicator visible
   - Check focus order follows visual order
   - Validate element is announced properly (check ARIA)
3. Test modal focus traps:
   - Tab should cycle within modal
   - Escape should close modal
   - Focus should return to trigger on close
4. Test form keyboard submission (Enter key)
```

**Implementation:**
```javascript
// Get all focusable elements
const focusable = await browser_evaluate({
  function: `() => {
    const selector = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(document.querySelectorAll(selector)).map(el => ({
      tag: el.tagName,
      text: el.textContent || el.ariaLabel || 'No label',
      tabIndex: el.tabIndex,
      visible: el.offsetParent !== null
    }));
  }`
});

// Tab through each
for (let i = 0; i < focusable.length; i++) {
  await browser_press_key({ key: 'Tab' });

  // Check focus indicator visible
  const hasFocus = await browser_evaluate({
    function: `() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' ||
             styles.boxShadow !== 'none' ||
             el.classList.contains('ring-2');
    }`
  });

  if (!hasFocus) {
    violations.push({
      element: focusable[i],
      issue: 'No visible focus indicator'
    });
  }
}
```

#### D. Screen Reader Simulation

```javascript
// Check ARIA tree structure
const ariaTree = await browser_snapshot();

// Validate:
// - All interactive elements have accessible names
// - Heading hierarchy is correct
// - Form fields have labels
// - Landmark regions are properly labeled
```

#### E. Color Contrast Verification

```javascript
// Get computed contrast ratios from browser
const contrastIssues = await browser_evaluate({
  function: `() => {
    const results = [];
    const elements = document.querySelectorAll('*');

    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const bgColor = styles.backgroundColor;

      if (color && bgColor) {
        const ratio = calculateContrast(color, bgColor);
        const fontSize = parseInt(styles.fontSize);
        const fontWeight = parseInt(styles.fontWeight);

        const isLargeText = fontSize >= 19 || (fontSize >= 14 && fontWeight >= 700);
        const minRatio = isLargeText ? 3.0 : 4.5;

        if (ratio < minRatio) {
          results.push({
            element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
            color: color,
            bgColor: bgColor,
            ratio: ratio.toFixed(2),
            required: minRatio
          });
        }
      }
    });

    return results;
  }`
});
```

### 4. Generate Comprehensive Audit Report

Format output as detailed accessibility audit:

```markdown
# ♿ WCAG 2.2 Accessibility Audit Report

## Compliance Summary

- **WCAG Level {AA|AAA} Compliance**: {XX}%
- **Total Checkpoints**: {count}
- **Passed**: {count} ✅
- **Failed**: {count} ❌
- **Warnings**: {count} ⚠️

**Overall Grade**: {A+ | A | B | C | D | F}

---

## Critical Violations (Level A - Must Fix)

### 1. Missing Form Labels - WCAG 3.3.2

**Severity**: CRITICAL - Level A Failure
**Impact**: Screen reader users cannot determine what information to enter
**Found**: {count} instances

**File**: src/components/LoginForm.tsx

**Line 23:**
```tsx
<Input type="email" placeholder="Enter email" />
```

**Fix:**
```tsx
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" placeholder="Enter email" />
```

**Testing**: Verified with screen reader - field announced as "Edit text" (no label)

---

### 2. Icon Buttons Without Labels - WCAG 4.1.2

**Severity**: CRITICAL - Level A Failure
**Impact**: Button purpose unknown to screen reader users
**Found**: {count} instances

**File**: src/components/Navigation.tsx
**Line 101:**
```tsx
<Button size="icon" onClick={handleSignOut}>
  <LogOut className="w-4 h-4" />
</Button>
```

**Fix:**
```tsx
<Button size="icon" onClick={handleSignOut} aria-label="Sign out">
  <LogOut className="w-4 h-4" />
</Button>
```

**Testing**: Screen reader announces "Button" → Should announce "Sign out button"

---

## High Priority Issues (Level AA - Should Fix)

### 3. Insufficient Color Contrast - WCAG 1.4.3

**Severity**: HIGH - Level AA Failure
**Impact**: Text difficult to read for users with low vision
**Found**: {count} instances

**Location**: src/components/Hero.tsx:45

**Issue:**
- Foreground: text-gray-400 (#9CA3AF)
- Background: bg-white (#FFFFFF)
- Contrast Ratio: 2.8:1
- Required: 4.5:1 (AA) or 7.0:1 (AAA)

**Fix:**
```tsx
// Change to text-gray-700 (5.7:1 contrast)
<p className="text-gray-700">Readable text</p>

// Or use semantic token
<p className="text-foreground">Readable text</p>
```

**Browser Test**: Confirmed with color picker - insufficient contrast

---

### 4. Missing Focus Indicators - WCAG 2.4.7

**Severity**: HIGH - Level AA Failure
**Impact**: Keyboard users cannot see which element has focus
**Found**: {count} instances

**File**: src/components/CustomButton.tsx:12

**Current:**
```tsx
<button className="focus:outline-none bg-primary">
  No focus indicator
</button>
```

**Fix:**
```tsx
<button className="
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
  bg-primary
">
  With focus indicator
</button>
```

**Keyboard Test**: Tabbed to element - no visible focus indicator

---

## Medium Priority (Level AAA - Recommended)

### 5. Touch Target Size - WCAG 2.5.5

**Severity**: MEDIUM - Level AAA Recommendation
**Impact**: Difficult to tap on mobile devices
**Found**: {count} instances

**File**: src/components/admin/UserActions.tsx:34

**Current:** 32×32px touch target
**Recommended:** 44×44px minimum

**Fix:**
```tsx
// Change from h-8 w-8 to h-11 w-11
<Button size="icon" className="h-11 w-11 sm:h-9 sm:w-9">
  Larger on mobile
</Button>
```

---

## Keyboard Navigation Flow

**Tab Order**: {Pass/Fail}

1. Header → Skip to main content link ✅
2. Logo → Focusable ✅
3. Navigation menu items → All focusable ✅
4. Main content → Logical order ✅
5. Form fields → Correct tab order ✅
6. Submit button → Focusable ✅
7. Footer → Last in order ✅

**Modal Focus Trap**: {Pass/Fail}
- Focus enters modal ✅
- Tab cycles within modal ✅
- Escape closes modal ✅
- Focus returns to trigger ✅

**Issues Found**:
- Line 145: Focus escapes modal to background (fix with Radix Dialog)

---

## Color Contrast Matrix

| Element | Foreground | Background | Ratio | Status | Required |
|---------|-----------|------------|-------|--------|----------|
| Body text | #1A1F2E | #F5F7FA | 12.6:1 | ✅ AAA | 4.5:1 |
| Muted text | #64748B | #FFFFFF | 4.8:1 | ✅ AA | 4.5:1 |
| Primary button | #FFFFFF | #2563EB | 5.2:1 | ✅ AA | 4.5:1 |
| Link text | #2563EB | #FFFFFF | 5.9:1 | ✅ AA | 4.5:1 |
| Disabled text | #9CA3AF | #FFFFFF | 2.8:1 | ❌ FAIL | 4.5:1 |
| Accent button | #00CCFF | #1A1F2E | 3.2:1 | ❌ FAIL | 4.5:1 |

---

## Screen Reader Experience

**Landmarks**: {Pass/Fail}
- Page has `<main>` landmark ✅
- Navigation in `<nav>` ✅
- Footer in `<footer>` or `role="contentinfo"` ✅

**Headings**: {Pass/Fail}
- Page has one `<h1>` ✅
- Heading hierarchy logical ✅
- No heading level skips ✅

**Forms**: {Pass/Fail}
- All inputs labeled ❌ (3 inputs missing labels)
- Required fields indicated ✅
- Error messages associated ✅

**Dynamic Content**: {Pass/Fail}
- Toast notifications have `aria-live="polite"` ❌
- Loading states announced ✅
- Form submission feedback ✅

---

## Compliance Score Breakdown

**Level A (25 checkpoints)**: 22/25 passed (88%)
- ❌ 1.1.1 Non-text Content: 2 images missing alt text
- ❌ 3.3.2 Labels or Instructions: 3 inputs without labels
- ❌ 4.1.2 Name, Role, Value: 5 buttons without accessible names

**Level AA (13 additional checkpoints)**: 10/13 passed (77%)
- ❌ 1.4.3 Contrast (Minimum): 6 contrast violations
- ❌ 2.4.7 Focus Visible: 2 elements missing focus indicators
- ❌ 4.1.3 Status Messages: Toast missing aria-live

**Level AAA (23 additional checkpoints)**: 20/23 passed (87%)
- ❌ 1.4.6 Contrast (Enhanced): 4 elements don't meet AAA (7:1)
- ❌ 2.5.5 Target Size: 8 touch targets < 44×44px
- ❌ 3.3.6 Error Prevention: No confirmation for critical actions

**Overall WCAG 2.2 Level AA Compliance: {82}%**

---

## Remediation Checklist

### Immediate (Critical - Level A)
- [ ] Add alt text to 2 images (Lines 45, 67)
- [ ] Add labels to 3 form inputs (LoginForm.tsx: 23, 34, 45)
- [ ] Add aria-label to 5 icon buttons (Navigation.tsx: 101, UserActions.tsx: 34, 56, 78, 89)

### High Priority (Level AA)
- [ ] Fix 6 color contrast violations
- [ ] Add focus indicators to 2 custom elements
- [ ] Add aria-live to toast notifications

### Recommended (Level AAA)
- [ ] Increase touch target sizes on mobile (8 elements)
- [ ] Enhance contrast for AAA compliance (4 elements)
- [ ] Add confirmation dialogs for delete actions

---

## Testing Summary

**Automated Tests** (axe-core):
- Violations: {count}
- Passes: {count}
- Incomplete: {count}

**Manual Tests**:
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader simulation
- ✅ Color contrast (browser DevTools)
- ✅ Touch target sizes

**Browser**: Chromium (Playwright)
**Viewport**: 1280×720 (Desktop)
**Date**: {timestamp}

---

## Next Steps

1. **Fix Critical Issues** (30 min)
   - Add missing alt text
   - Add form labels
   - Add aria-label to icon buttons

2. **Address High Priority** (1 hour)
   - Fix color contrast issues
   - Add focus indicators
   - Implement aria-live regions

3. **Consider Level AAA** (optional)
   - Increase touch targets for mobile
   - Enhance contrast ratios
   - Add confirmation dialogs

4. **Re-test**
   ```bash
   /accessibility-audit --level AA
   ```

5. **Validate with Real Users**
   - Test with screen reader (NVDA, JAWS, VoiceOver)
   - Test keyboard-only navigation
   - Test on mobile devices

---

## Resources

- **WCAG 2.2 Guidelines**: https://www.w3.org/WAI/WCAG22/quickref/
- **axe DevTools**: Browser extension for ongoing testing
- **NVDA Screen Reader**: Free screen reader for testing
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

**Audit completed by**: Senior UI/UX Designer 2026 Plugin
**Standards**: WCAG 2.2 Level {AA|AAA}
**Method**: Static analysis + Playwright browser testing
**Confidence**: High
```

---

## Scoring Algorithm

```typescript
// Calculate compliance percentage
const totalCheckpoints = {
  A: 25,    // Level A checkpoints
  AA: 38,   // Level A + AA checkpoints
  AAA: 61   // All checkpoints
};

const level = args.level || 'AA';
const target = totalCheckpoints[level];

const passedCount = violations.filter(v => v.level === level && v.passed).length;
const compliance = (passedCount / target) * 100;

// Grade assignment
const grade =
  compliance >= 95 ? 'A+' :
  compliance >= 90 ? 'A' :
  compliance >= 80 ? 'B' :
  compliance >= 70 ? 'C' :
  compliance >= 60 ? 'D' : 'F';
```

---

## Tools to Use

- **Glob**: Find target files
- **Read**: Load file contents for static analysis
- **Grep**: Search for accessibility patterns
- **Playwright MCP** (if browser=true):
  - `browser_navigate`: Load page
  - `browser_snapshot`: Get accessibility tree
  - `browser_evaluate`: Run axe-core, check contrast
  - `browser_press_key`: Test keyboard navigation
- **Bash**: Check if dev server is running

---

When performing the audit, be thorough, specific, and provide actionable remediation guidance. Prioritize WCAG Level A violations (critical), then Level AA (high priority), then Level AAA (recommended). Always include real browser testing when possible for the most accurate results.

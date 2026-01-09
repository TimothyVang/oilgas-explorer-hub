# WCAG 2.2 Compliance Guide Skill

This skill should be used when performing accessibility audits, validating WCAG compliance, and providing remediation checklists. Apply when running accessibility-audit commands or evaluating components against Web Content Accessibility Guidelines 2.2 Level AA/AAA standards.

## WCAG 2.2 Principles (POUR)

1. **Perceivable** - Information must be presentable to users in ways they can perceive
2. **Operable** - Interface components must be operable by all users
3. **Understandable** - Information and operation must be understandable
4. **Robust** - Content must work with current and future technologies

---

## Level AA Compliance Checklist

### Perceivable

#### 1.1 Text Alternatives (Level A)
- [ ] All images have alt text (`<img alt="description">`)
- [ ] Decorative images have empty alt (`<img alt="">` or `role="presentation"`)
- [ ] Icon-only buttons have `aria-label`
- [ ] Complex images have detailed descriptions

#### 1.3 Adaptable (Level A)
- [ ] Semantic HTML used (`<nav>`, `<main>`, `<article>`, `<button>`)
- [ ] Heading hierarchy follows h1 → h2 → h3 (no skipping)
- [ ] Form inputs have associated labels (`<label htmlFor>`)
- [ ] Lists use proper markup (`<ul>`, `<ol>`, `<dl>`)
- [ ] Tables have proper headers (`<th scope>`)

#### 1.4.3 Contrast (Minimum) - Level AA
- [ ] Normal text: 4.5:1 contrast ratio minimum
- [ ] Large text (≥19px or ≥14px bold): 3.0:1 contrast ratio minimum
- [ ] UI components (buttons, inputs, borders): 3.0:1 contrast ratio minimum
- [ ] Focus indicators: 3.0:1 contrast ratio minimum

#### 1.4.10 Reflow (Level AA)
- [ ] Content readable at 200% zoom without horizontal scrolling
- [ ] Responsive design works at 320px viewport width
- [ ] No loss of information or functionality when zoomed

#### 1.4.11 Non-text Contrast (Level AA)
- [ ] UI component borders: 3.0:1 contrast ratio
- [ ] Focus indicators: 3.0:1 contrast ratio
- [ ] Graphical objects: 3.0:1 contrast ratio

### Operable

#### 2.1.1 Keyboard (Level A)
- [ ] All functionality available via keyboard
- [ ] No keyboard traps (can navigate away from all elements)
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Custom interactive elements have `tabIndex={0}`

#### 2.1.4 Character Key Shortcuts (Level A)
- [ ] Single-key shortcuts can be remapped or disabled
- [ ] Shortcuts only active when component has focus

#### 2.4.3 Focus Order (Level A)
- [ ] Tab order follows visual order
- [ ] Focus doesn't jump unexpectedly
- [ ] Logical progression through interactive elements

#### 2.4.7 Focus Visible (Level AA)
- [ ] Keyboard focus indicator visible on all interactive elements
- [ ] Focus indicator has 2px minimum outline
- [ ] Focus indicator contrast ratio ≥3:1

#### 2.5.5 Target Size (Level AAA)
- [ ] Touch targets ≥44×44 CSS pixels (Level AAA recommended)
- [ ] Spacing between targets ≥8px

### Understandable

#### 3.2.4 Consistent Identification (Level AA)
- [ ] Components with same functionality labeled consistently
- [ ] Icons with same meaning used consistently
- [ ] Similar actions use similar UI patterns

#### 3.3.1 Error Identification (Level A)
- [ ] Form errors clearly identified
- [ ] Error messages describe problem in text
- [ ] Invalid fields indicated (not just color)

#### 3.3.2 Labels or Instructions (Level A)
- [ ] All form inputs have labels
- [ ] Required fields indicated (`required` attribute + visual indicator)
- [ ] Input format explained (e.g., "MM/DD/YYYY")
- [ ] Instructions provided before form, not after

#### 3.3.3 Error Suggestion (Level AA)
- [ ] Error messages suggest how to fix the problem
- [ ] Validation provides helpful guidance

#### 3.3.4 Error Prevention (Legal, Financial, Data) - Level AA
- [ ] Confirm before submitting critical forms
- [ ] Allow review and correction before final submission
- [ ] Provide undo or reversal mechanism

### Robust

#### 4.1.2 Name, Role, Value (Level A)
- [ ] All UI components have programmatic names
- [ ] Roles correctly identified (button, link, dialog, etc.)
- [ ] States communicated (expanded, selected, checked)
- [ ] ARIA attributes used correctly

#### 4.1.3 Status Messages (Level AA)
- [ ] Status messages use `aria-live` regions
- [ ] Success messages announced to screen readers
- [ ] Error messages announced to screen readers
- [ ] Loading states communicated

---

## Common WCAG Violations and Fixes

### Violation: Missing Form Labels
**Issue**: Input without associated label
**WCAG**: 1.3.1, 3.3.2 (Level A)
```tsx
// Bad
<Input placeholder="Email" />

// Good
<Label htmlFor="email">Email</Label>
<Input id="email" placeholder="you@example.com" />
```

### Violation: Insufficient Contrast
**Issue**: Text contrast < 4.5:1
**WCAG**: 1.4.3 (Level AA)
```tsx
// Bad: text-gray-400 on white (2.8:1)
<p className="text-gray-400">Low contrast text</p>

// Good: text-gray-700 on white (5.7:1)
<p className="text-gray-700">Sufficient contrast</p>
```

### Violation: Missing Alt Text
**Issue**: Image without alt attribute
**WCAG**: 1.1.1 (Level A)
```tsx
// Bad
<img src="/logo.png" />

// Good
<img src="/logo.png" alt="Company Logo" />

// Decorative
<img src="/decoration.png" alt="" role="presentation" />
```

### Violation: Icon-Only Button
**Issue**: Button without accessible name
**WCAG**: 4.1.2 (Level A)
```tsx
// Bad
<button><Settings /></button>

// Good
<button aria-label="Open settings"><Settings /></button>
```

### Violation: Keyboard Trap
**Issue**: Cannot navigate away from modal
**WCAG**: 2.1.2 (Level A)
```tsx
// Bad: No focus trap, no Escape handling
<div className="modal">Content</div>

// Good: Radix UI Dialog (handles focus trap automatically)
<Dialog>
  <DialogContent>
    {/* Focus trapped, Escape key works */}
  </DialogContent>
</Dialog>
```

### Violation: Missing ARIA Expanded
**Issue**: Collapsible element state not communicated
**WCAG**: 4.1.2 (Level A)
```tsx
// Bad
<button onClick={toggle}>Menu</button>

// Good
<button onClick={toggle} aria-expanded={isOpen} aria-controls="menu-id">
  Menu
</button>
<div id="menu-id" hidden={!isOpen}>Menu items</div>
```

### Violation: No Focus Indicator
**Issue**: Cannot see keyboard focus
**WCAG**: 2.4.7 (Level AA)
```tsx
// Bad
<Button className="focus:outline-none">Click</Button>

// Good
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Click
</Button>
```

---

## Testing Workflow

### Automated Testing
1. **axe DevTools** (Browser Extension)
   - Scan page for violations
   - Categorizes by severity (Critical, Serious, Moderate, Minor)
   - Provides remediation guidance

2. **Lighthouse** (Chrome DevTools)
   - Overall accessibility score
   - Identifies common issues
   - Performance + accessibility

3. **WAVE** (Browser Extension)
   - Visual feedback on errors/warnings
   - Highlights elements with issues

### Manual Testing
1. **Keyboard Navigation**
   - Tab through entire page
   - Verify focus indicators visible
   - Test Escape key in modals
   - Verify no keyboard traps

2. **Screen Reader Testing**
   - NVDA (Windows, free)
   - JAWS (Windows, paid)
   - VoiceOver (Mac, built-in)
   - Verify announcements clear and helpful

3. **Zoom Testing**
   - Zoom to 200%
   - Verify content readable
   - Check no horizontal scrolling

4. **Color Contrast**
   - Use browser DevTools color picker
   - Check all text/background pairs
   - Validate against WCAG ratios

---

## Compliance Score Calculation

### Scoring Method
- **Total Issues**: Count of all WCAG violations
- **Critical**: Level A failures (must fix)
- **High**: Level AA failures (should fix)
- **Medium**: Level AAA failures (nice to fix)
- **Low**: Best practice suggestions

### Compliance Percentage
```
Compliance % = (Total Checkpoints - Violations) / Total Checkpoints × 100

Level AA Compliance: All Level A + Level AA requirements met
Level AAA Compliance: All requirements met (Level A + AA + AAA)
```

---

## Quick Reference: ARIA Attributes

- `aria-label`: Directly provides accessible name
- `aria-labelledby`: References another element for label
- `aria-describedby`: Provides additional description
- `aria-expanded`: Indicates if element is expanded (true/false)
- `aria-controls`: ID of element controlled by this element
- `aria-live`: Announces dynamic content (polite/assertive)
- `aria-hidden`: Hides element from screen readers (true/false)
- `role`: Defines element type (button, dialog, menu, etc.)

---

Use this guide for comprehensive WCAG 2.2 Level AA compliance auditing and remediation planning.

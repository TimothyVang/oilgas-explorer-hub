# Accessibility Standards Skill

This skill should be used when analyzing components for accessibility compliance, WCAG 2.2 AA/AAA standards, ARIA patterns, keyboard navigation, screen reader compatibility, and 2026 modern accessibility best practices.

## WCAG 2.2 Level AA/AAA Requirements

### Perceivable - Information Must Be Presented in Ways Users Can Perceive

**1.1 Text Alternatives**
- All non-text content (images, icons, charts) must have text alternatives
- Images: `<img alt="descriptive text">`
- Icon-only buttons: `<button aria-label="descriptive action">` or `aria-labelledby`
- Decorative images: `<img alt="">` or `role="presentation"`
- Complex graphics: Provide detailed descriptions via `aria-describedby` or nearby text

**1.3 Adaptable Content**
- Content structure must be programmatically determinable
- Use semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<header>`, `<footer>`
- Heading hierarchy: h1 → h2 → h3 (no skipping levels)
- Form labels: `<label htmlFor="input-id">` or `aria-label`
- Lists for list content: `<ul>`, `<ol>`, `<dl>`
- Tables with proper structure: `<th scope="col">`, `<caption>`

**1.4 Distinguishable - Make It Easier to See and Hear Content**
- **Color Contrast Minimums**:
  - Level AA: 4.5:1 for normal text (<19px or <14px bold)
  - Level AA: 3.0:1 for large text (≥19px or ≥14px bold)
  - Level AA: 3.0:1 for UI components (buttons, form inputs, focus indicators)
  - Level AAA: 7.0:1 for normal text
  - Level AAA: 4.5:1 for large text
- Information must not rely on color alone (use icons, patterns, text)
- Text resizing: Content must be readable at 200% zoom without loss of functionality
- Images of text: Avoid except for logos or essential (Level AA)

### Operable - Interface Must Be Operable for All Users

**2.1 Keyboard Accessible**
- All functionality available via keyboard (no mouse-only interactions)
- Focusable elements: buttons, links, form inputs, custom interactive components
- Focus indicators must be visible (2px solid outline minimum)
- No keyboard traps (users can navigate away from any component)
- Tab order must be logical (follows visual flow)
- Custom components: Add `tabIndex={0}` for focusable, `tabIndex={-1}` for programmatic focus

**2.4 Navigable**
- Skip links: `<a href="#main-content">Skip to main content</a>` at page top
- Page titles: Unique and descriptive `<title>` elements
- Focus order: Logical sequence that preserves meaning
- Link purpose: Clear from link text or context
- Multiple navigation mechanisms (nav menus, search, site map)
- Headings and labels: Descriptive and informative

**2.5 Input Modalities**
- Touch targets: Minimum 44×44 CSS pixels (Level AAA)
- Pointer gestures: Provide single-pointer alternatives (no multi-finger required)
- Motion actuation: Provide UI-based alternatives to device motion triggers

### Understandable - Content Must Be Understandable

**3.2 Predictable**
- Components behave consistently (buttons, links, forms)
- Navigation appears in same place across pages
- Components identified consistently (same naming/icons)
- Changes of context only occur on user request (no auto-redirects on focus)

**3.3 Input Assistance**
- Form errors: Identify and describe errors clearly
- Labels: All form inputs have associated labels
- Required fields: Marked with `required` attribute and visual/text indicator
- Error prevention: Confirm before submitting critical forms (deletions, purchases)
- Error suggestions: Provide helpful guidance to fix errors

### Robust - Content Must Work with Current and Future Technologies

**4.1 Compatible**
- Valid HTML: Properly nested tags, unique IDs, no duplicate attributes
- ARIA implementation: Correct roles, states, properties
- Name, Role, Value: All UI components have programmatically determinable names, roles, and values
- Status messages: Use `aria-live` for dynamic updates

---

## ARIA Patterns and Landmark Roles

### Landmark Roles (For Page Structure)

- `<nav>` or `role="navigation"` - Navigation sections
- `<main>` or `role="main"` - Main content (one per page)
- `<aside>` or `role="complementary"` - Supporting content
- `<header>` or `role="banner"` - Site header (one per page)
- `<footer>` or `role="contentinfo"` - Site footer (one per page)
- `role="search"` - Search functionality
- `role="form"` - Form regions (if named with aria-label)
- `role="region"` - Significant sections (must have aria-label)

### Common Interactive ARIA Patterns

**Buttons**
```tsx
<button type="button" aria-label="Close dialog">
  <X />
</button>
```

**Dialogs/Modals**
```tsx
<div role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Deletion</h2>
  <p id="dialog-desc">Are you sure you want to delete this item?</p>
</div>
```

**Disclosures/Accordions**
```tsx
<button
  aria-expanded={isOpen}
  aria-controls="panel-id"
  onClick={toggle}
>
  Toggle Panel
</button>
<div id="panel-id" hidden={!isOpen}>
  Panel content
</div>
```

**Tabs**
```tsx
<div role="tablist" aria-label="Account settings">
  <button role="tab" aria-selected={isActive} aria-controls="panel-id">
    Profile
  </button>
</div>
<div role="tabpanel" id="panel-id" aria-labelledby="tab-id">
  Panel content
</div>
```

**Comboboxes/Select Menus**
- Use Radix UI Select or similar library (handles ARIA automatically)
- `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`

**Live Regions (Dynamic Content)**
```tsx
<div aria-live="polite" aria-atomic="true">
  Item added to cart
</div>
```
- `aria-live="polite"` - Announce when user is idle
- `aria-live="assertive"` - Announce immediately (errors, urgent)
- `aria-atomic="true"` - Announce entire region, not just changes

---

## Keyboard Navigation Best Practices

### Standard Keyboard Patterns

- **Tab**: Move focus forward
- **Shift + Tab**: Move focus backward
- **Enter**: Activate buttons, links, submit forms
- **Space**: Toggle checkboxes, activate buttons
- **Escape**: Close modals, cancel actions, clear selections
- **Arrow Keys**: Navigate within components (tabs, menus, radio groups)

### Focus Management

**Visible Focus Indicators**
```css
/* Modern approach with :focus-visible (2026 standard) */
button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Remove outline for mouse clicks, keep for keyboard */
button:focus:not(:focus-visible) {
  outline: none;
}
```

**Focus Traps (Modals)**
- When modal opens: Move focus to first interactive element or modal container
- Tab cycles only through modal elements (trap focus inside)
- Escape closes modal and returns focus to trigger button
- Use libraries like `focus-trap-react` or Radix UI Dialog (handles automatically)

**Skip Links**
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Tab Index Best Practices

- `tabIndex={0}`: Makes element focusable in natural tab order
- `tabIndex={-1}`: Makes element programmatically focusable (not in tab order)
- Avoid `tabIndex > 0`: Disrupts natural tab order, confuses users

---

## Screen Reader Compatibility

### Screen Reader Announcements

**Descriptive Labels**
```tsx
// Good - Clear context
<button aria-label="Delete user John Doe">
  <Trash2 />
</button>

// Bad - Not descriptive
<button>
  <Trash2 />
</button>
```

**Hidden Content for Screen Readers**
```tsx
// Tailwind CSS approach
<span className="sr-only">
  This text is only read by screen readers
</span>

// CSS approach
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Form Field Descriptions**
```tsx
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-hint"
/>
<span id="email-hint" className="text-sm text-muted-foreground">
  We'll never share your email
</span>
```

### ARIA Labels vs Accessible Names

- `aria-label`: Directly provides accessible name
- `aria-labelledby`: References another element's text as label
- `aria-describedby`: Provides additional description (help text, errors)

**Precedence** (highest to lowest):
1. `aria-labelledby`
2. `aria-label`
3. `<label>` element
4. `placeholder` (not reliable, avoid as sole label)
5. `title` attribute (last resort, not announced by all screen readers)

---

## 2026 Modern Accessibility Standards

### CSS :focus-visible (Widely Supported)

```css
/* Only show focus indicator when keyboard navigating */
button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Hide for mouse clicks */
button:focus:not(:focus-visible) {
  outline: none;
}
```

### prefers-reduced-motion (Respect User Preferences)

```css
/* Default animation */
.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

/* Disable for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
    opacity: 1;
  }
}
```

```tsx
// React/Tailwind approach
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{
    duration: 0.6,
    ease: 'easeOut',
    // Respect prefers-reduced-motion
    ...(window.matchMedia('(prefers-reduced-motion: reduce)').matches && {
      duration: 0
    })
  }}
>
  Content
</motion.div>
```

### prefers-color-scheme (Dark Mode Accessibility)

```css
/* Ensure sufficient contrast in both modes */
:root {
  --text: hsl(222 47% 11%);  /* Dark text on light bg */
  --background: hsl(0 0% 100%);
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: hsl(0 0% 98%);  /* Light text on dark bg */
    --background: hsl(222 47% 11%);
  }
}
```

### ARIA 1.3 New Features

- `aria-description`: Provides description without requiring separate element
```tsx
<button aria-description="This action cannot be undone">
  Delete Account
</button>
```

- `aria-brailleroledescription`: Customizes role description for braille devices
- Enhanced live region support

---

## Common Accessibility Issues and Fixes

### Issue 1: Missing Alt Text

**Problem:**
```tsx
<img src="/hero-bg.jpg" />
```

**Fix:**
```tsx
<img src="/hero-bg.jpg" alt="Oil pump jacks at sunset in an energy field" />

// If decorative
<img src="/decorative-pattern.png" alt="" role="presentation" />
```

### Issue 2: Form Input Without Label

**Problem:**
```tsx
<Input placeholder="Enter your email" />
```

**Fix:**
```tsx
<label htmlFor="email">Email Address</label>
<Input id="email" placeholder="Enter your email" />

// Or with shadcn/ui Form
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email Address</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
    </FormItem>
  )}
/>
```

### Issue 3: Icon-Only Button

**Problem:**
```tsx
<Button>
  <Settings />
</Button>
```

**Fix:**
```tsx
<Button aria-label="Open settings">
  <Settings />
</Button>

// Or with visible text
<Button>
  <Settings />
  <span className="ml-2">Settings</span>
</Button>
```

### Issue 4: Insufficient Color Contrast

**Problem:**
```tsx
<button className="bg-accent text-primary">
  Click Me
</button>
// Contrast: 2.8:1 (fails AA)
```

**Fix:**
```tsx
<button className="bg-accent text-accent-foreground">
  Click Me
</button>
// Contrast: 5.2:1 (passes AA)
```

### Issue 5: Modal Focus Trap Missing

**Problem:**
```tsx
<Dialog>
  <DialogContent>
    {/* Focus can escape to background */}
  </DialogContent>
</Dialog>
```

**Fix:**
```tsx
// Use Radix UI Dialog (handles focus trap automatically)
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Focus is trapped, Escape key works */}
  </DialogContent>
</Dialog>
```

### Issue 6: Non-Keyboard Accessible Dropdown

**Problem:**
```tsx
<div onClick={toggleDropdown}>
  Menu <ChevronDown />
</div>
```

**Fix:**
```tsx
<button
  onClick={toggleDropdown}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    }
  }}
  aria-expanded={isOpen}
  aria-haspopup="menu"
>
  Menu <ChevronDown />
</button>
```

### Issue 7: Missing Heading Hierarchy

**Problem:**
```tsx
<h1>Page Title</h1>
<h3>Section Title</h3>  {/* Skipped h2! */}
```

**Fix:**
```tsx
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
```

---

## Testing Tools and Methods

### Automated Testing Tools

- **axe DevTools** (Browser Extension): Scan pages for WCAG violations
- **Lighthouse** (Chrome DevTools): Accessibility score and recommendations
- **WAVE** (Browser Extension): Visual feedback on accessibility issues
- **Pa11y**: Command-line accessibility testing tool
- **eslint-plugin-jsx-a11y**: Lint React code for accessibility issues

### Manual Testing Methods

1. **Keyboard Navigation Test**:
   - Unplug mouse, navigate entire site with Tab, Enter, Escape, Arrow keys
   - Verify all functionality accessible
   - Check focus indicators visible

2. **Screen Reader Test**:
   - NVDA (Windows, free)
   - JAWS (Windows, paid)
   - VoiceOver (Mac, built-in)
   - Navigate page, verify announcements clear and helpful

3. **Color Contrast Test**:
   - Use browser DevTools color picker
   - Check all text/background combinations
   - Validate against WCAG AA/AAA standards

4. **Zoom Test**:
   - Zoom browser to 200%
   - Verify content remains readable
   - Check no horizontal scrolling (responsive design)

5. **Motion Sensitivity Test**:
   - Enable prefers-reduced-motion in OS settings
   - Verify animations reduced or disabled
   - Check functionality remains intact

---

## Quick Reference Checklist

### Every Component Should Have:

- [ ] Semantic HTML elements (nav, main, article, button, not div onclick)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] All images have alt text (or alt="" if decorative)
- [ ] All form inputs have associated labels
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible (2px minimum)
- [ ] Color contrast meets 4.5:1 for text (AA)
- [ ] Touch targets ≥44×44px for mobile
- [ ] ARIA attributes used correctly (roles, labels, states)
- [ ] No keyboard traps (can navigate away from all components)
- [ ] Error messages clearly identify issues and provide guidance

### Modals/Dialogs Must Have:

- [ ] `role="dialog"`
- [ ] `aria-labelledby` referencing title
- [ ] `aria-describedby` for description (optional)
- [ ] Focus trap (Tab cycles within modal only)
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element on close

### Forms Must Have:

- [ ] Each input has `<label htmlFor="id">` or `aria-label`
- [ ] Required fields marked (required attribute + visual indicator)
- [ ] Error messages associated with inputs (`aria-describedby`)
- [ ] Submit button clearly labeled
- [ ] Error summary at form top (if validation fails)

---

When analyzing components, prioritize WCAG 2.2 Level AA compliance. Level AAA is ideal but not always achievable. Focus on keyboard navigation, clear labels, color contrast, and semantic HTML as the foundation of accessible design.

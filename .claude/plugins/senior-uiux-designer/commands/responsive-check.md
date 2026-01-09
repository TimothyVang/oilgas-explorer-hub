---
name: responsive-check
description: Multi-viewport responsive design validation with mobile-first pattern checking and browser testing
arguments:
  - name: target
    description: File path or URL to test (defaults to current file or localhost)
    type: string
    required: false
  - name: viewports
    description: Comma-separated viewport widths (e.g., "375,768,1920")
    type: string
    default: "375,640,768,1024,1280,1920"
    required: false
  - name: browser
    description: Run live browser tests at each viewport (default true)
    type: boolean
    default: true
    required: false
examples:
  - /responsive-check
  - /responsive-check src/components/Hero.tsx
  - /responsive-check http://localhost:5173 --viewports "375,768,1920"
  - /responsive-check src/pages/Dashboard.tsx --browser false
---

Validate responsive design across all breakpoints with mobile-first pattern checking and multi-viewport browser testing.

## Implementation Steps

### 1. Parse Target and Viewports

**Target Processing**:
- If URL: Use for browser testing only
- If file/directory: Static analysis + browser testing
- If no target: Use current file or http://localhost:5173

**Viewport Processing**:
```javascript
const defaultViewports = [
  { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
  { width: 640, height: 1136, name: 'Tablet Portrait (sm)' },
  { width: 768, height: 1024, name: 'Tablet Landscape (md)' },
  { width: 1024, height: 768, name: 'Laptop (lg)' },
  { width: 1280, height: 720, name: 'Desktop (xl)' },
  { width: 1920, height: 1080, name: 'Large Desktop (2xl)' }
];

// Parse custom viewports if provided
const viewports = args.viewports
  ? args.viewports.split(',').map(w => ({
      width: parseInt(w.trim()),
      height: Math.floor(parseInt(w.trim()) * 0.75), // 4:3 aspect
      name: `Custom ${w}px`
    }))
  : defaultViewports;
```

### 2. Static Analysis (File-Based)

Reference: **responsive-design-best-practices.md** skill

#### A. Mobile-First Pattern Validation

**Check for Desktop-First Anti-Patterns**:

Use Grep to find problematic patterns:
```bash
# Look for base classes that are desktop-oriented
grep -n 'flex-row\s' {file}         # Should be flex-col (mobile) then sm:flex-row
grep -n 'grid-cols-[2-9]' {file}   # Should start with grid-cols-1
grep -n 'text-[xl]' {file}          # Large text as default (should be text-base)
```

**Validate Progressive Enhancement**:
```tsx
// Good: Mobile-first
<div className="flex flex-col gap-4 sm:flex-row sm:gap-6 lg:gap-8">

// Bad: Desktop-first
<div className="flex flex-row gap-8 sm:flex-col sm:gap-4">
```

**Report Format:**
```
⚠️ Desktop-First Pattern Detected
Line 45: Base class assumes desktop layout
  <div className="flex flex-row gap-8 sm:flex-col">

Mobile-First Fix:
  <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 lg:gap-8">

Why: Mobile-first ensures good experience on smallest screens by default
```

#### B. Breakpoint Consistency

**Analyze Responsive Class Usage**:
```javascript
// Parse all Tailwind classes
const classes = content.match(/className="([^"]*)"/g);

// Extract responsive patterns
const responsiveClasses = {
  base: [],
  sm: [],
  md: [],
  lg: [],
  xl: [],
  '2xl': []
};

classes.forEach(classStr => {
  const matches = classStr.match(/(sm:|md:|lg:|xl:|2xl:)?(\S+)/g);
  matches?.forEach(cls => {
    const [, prefix, property] = cls.match(/^(sm:|md:|lg:|xl:|2xl:)?(.+)$/) || [];
    const bp = prefix ? prefix.replace(':', '') : 'base';
    responsiveClasses[bp].push(property);
  });
});

// Check for consistent patterns
// E.g., if component uses sm:gap-6, similar components should too
```

**Report Format:**
```
ℹ️ Breakpoint Pattern Suggestion
Found: text-base sm:text-lg md:text-xl lg:text-2xl

Similar pattern in Navigation.tsx uses:
  text-sm sm:text-base md:text-lg

Consider standardizing text scaling across components for consistency
```

#### C. Touch Target Size Validation

**Parse Element Sizes**:
```javascript
// Extract height/width classes
const sizes = content.match(/h-(\d+)|w-(\d+)/g);

// Convert to pixels (Tailwind: h-8 = 32px, h-11 = 44px)
const pixelMap = {
  '8': 32, '9': 36, '10': 40, '11': 44, '12': 48
};

// Flag interactive elements < 44px
```

**Check Buttons and Links**:
```bash
# Find button components
grep -n '<Button\|<button' {file}

# Check their sizes
grep -n 'size="icon"\|h-[0-9]\|w-[0-9]' {file}
```

**Report Format:**
```
❌ Touch Target Too Small (Mobile)
Line 89: Button is 32×32px, should be minimum 44×44px on mobile

Current:
  <Button size="icon" className="h-8 w-8">

Mobile-Optimized Fix:
  <Button size="icon" className="h-12 w-12 sm:h-9 sm:w-9">
  {/* 48×48px on mobile, 36×36px on desktop */}

WCAG 2.5.5 (Level AAA): Touch targets should be at least 44×44px
```

#### D. Flexible Layout Validation

**Check for Fixed Widths**:
```bash
# Find hardcoded pixel widths
grep -n 'w-\[[0-9]+px\]' {file}

# Find widths that might overflow
grep -n 'w-\[6[0-9][0-9]px\]' {file}  # 600+px might overflow mobile
```

**Report Format:**
```
⚠️ Fixed Width May Cause Horizontal Scroll
Line 67: w-[600px] will overflow on mobile (320-414px wide)

Current:
  <div className="w-[600px]">

Responsive Fix:
  <div className="w-full max-w-2xl mx-auto px-4">
  {/* Full width on mobile, max 672px on desktop, with padding */}
```

#### E. Typography Scaling

**Check Font Size Progression**:
```bash
# Find text size classes
grep -n 'text-\w\+' {file}

# Check for responsive scaling
grep -n 'text-xs\|text-sm.*sm:text\|md:text\|lg:text' {file}
```

**Report Format:**
```
✅ Good Responsive Typography
Line 23: <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">

Scales appropriately:
- Mobile: 24px
- Tablet: 30px
- Desktop: 36px
- Large: 48px
```

### 3. Browser Testing (if browser=true)

Reference: **Playwright MCP** configuration

#### A. Multi-Viewport Screenshot Capture

```javascript
// For each viewport
for (const viewport of viewports) {
  // Resize browser
  await browser_resize({
    width: viewport.width,
    height: viewport.height
  });

  // Take screenshot
  const filename = `responsive-${viewport.width}px.png`;
  await browser_take_screenshot({
    filename: filename,
    fullPage: true,  // Capture entire page, not just viewport
    type: 'png'
  });

  // Check for horizontal overflow
  const hasOverflow = await browser_evaluate({
    function: `() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    }`
  });

  if (hasOverflow) {
    const scrollWidth = await browser_evaluate({
      function: `() => document.documentElement.scrollWidth`
    });

    violations.push({
      viewport: viewport.name,
      issue: 'Horizontal overflow detected',
      scrollWidth: scrollWidth,
      viewportWidth: viewport.width,
      excess: scrollWidth - viewport.width
    });
  }
}
```

#### B. Interactive Element Testing

```javascript
// At mobile viewport (375px)
await browser_resize({ width: 375, height: 667 });

// Get all interactive elements
const interactiveElements = await browser_evaluate({
  function: `() => {
    const selector = 'a, button, input, select, textarea, [role="button"]';
    return Array.from(document.querySelectorAll(selector)).map(el => {
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        text: el.textContent?.substring(0, 30) || el.ariaLabel || 'No label',
        width: rect.width,
        height: rect.height,
        x: rect.left,
        y: rect.top
      };
    });
  }`
});

// Check touch target sizes
const tooSmall = interactiveElements.filter(el =>
  el.width < 44 || el.height < 44
);

// Check spacing between targets
for (let i = 0; i < interactiveElements.length - 1; i++) {
  const el1 = interactiveElements[i];
  const el2 = interactiveElements[i + 1];

  const distance = Math.sqrt(
    Math.pow(el2.x - (el1.x + el1.width), 2) +
    Math.pow(el2.y - (el1.y + el1.height), 2)
  );

  if (distance < 8) {  // WCAG recommends 8px minimum
    violations.push({
      element1: el1.text,
      element2: el2.text,
      spacing: distance,
      required: 8
    });
  }
}
```

#### C. Text Readability Testing

```javascript
// Check minimum font sizes at each viewport
for (const viewport of viewports) {
  await browser_resize({
    width: viewport.width,
    height: viewport.height
  });

  const fontSizes = await browser_evaluate({
    function: `() => {
      const results = [];
      const textElements = document.querySelectorAll('p, span, a, button, li');

      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const fontSize = parseFloat(styles.fontSize);
        if (fontSize > 0 && el.textContent.trim()) {
          results.push({
            element: el.tagName,
            text: el.textContent.substring(0, 20),
            fontSize: fontSize
          });
        }
      });

      return results;
    }`
  });

  // Flag text < 16px on mobile
  if (viewport.width < 640) {
    const tooSmall = fontSizes.filter(f => f.fontSize < 16);
    if (tooSmall.length > 0) {
      violations.push({
        viewport: viewport.name,
        issue: 'Text smaller than 16px on mobile (difficult to read)',
        count: tooSmall.length
      });
    }
  }
}
```

#### D. Layout Behavior Testing

```javascript
// Test common responsive patterns
const layoutTests = [
  {
    name: 'Navigation collapse',
    test: async () => {
      // Check if mobile menu appears at small viewport
      await browser_resize({ width: 375, height: 667 });
      const hasMobileMenu = await browser_evaluate({
        function: `() => {
          return document.querySelector('[aria-label*="menu"], [aria-label*="navigation"]') !== null;
        }`
      });
      return hasMobileMenu;
    }
  },
  {
    name: 'Grid responsiveness',
    test: async () => {
      // Check grid columns change at breakpoints
      const mobile = await browser_evaluate({
        function: `() => {
          const grid = document.querySelector('[class*="grid"]');
          if (!grid) return null;
          return window.getComputedStyle(grid).gridTemplateColumns;
        }`
      });

      await browser_resize({ width: 1280, height: 720 });
      const desktop = await browser_evaluate({
        function: `() => {
          const grid = document.querySelector('[class*="grid"]');
          if (!grid) return null;
          return window.getComputedStyle(grid).gridTemplateColumns;
        }`
      });

      return mobile !== desktop;  // Columns should change
    }
  }
];
```

### 4. Generate Comprehensive Report

```markdown
# 📱 Responsive Design Check Report

## Viewport Testing Results

### Mobile (375px)

**Screenshot**: [responsive-375px.png]

**Status**: ✅ PASS

**Findings**:
- ✅ No horizontal overflow
- ✅ All text ≥ 16px (readable)
- ✅ Touch targets adequate
- ⚠️ 2 buttons slightly small (40×40px, recommend 44×44px)

**Layout**:
- Single column grid
- Navigation collapsed to hamburger menu
- Cards stacked vertically
- Images full width

---

### Tablet Portrait (640px - sm breakpoint)

**Screenshot**: [responsive-640px.png]

**Status**: ✅ PASS

**Findings**:
- ✅ Layout adapts smoothly from mobile
- ✅ No overflow
- ✅ Grid changes to 2 columns
- ✅ Navigation expands (if designed for tablet+)

**Breakpoint Transition**:
- `sm:` classes activate
- Grid: 1 column → 2 columns
- Font size: Slight increase
- Spacing: Increased gaps

---

### Tablet Landscape (768px - md breakpoint)

**Screenshot**: [responsive-768px.png]

**Status**: ⚠️ WARNING

**Findings**:
- ✅ Layout responsive
- ⚠️ Sidebar takes 40% width (recommend 33% max)
- ✅ Touch targets still adequate

**Suggestions**:
```tsx
// Current: Sidebar too wide
<aside className="w-2/5 md:w-1/3">

// Recommended
<aside className="w-full md:w-1/3 lg:w-1/4">
{/* Full width mobile, 33% tablet, 25% desktop */}
```

---

### Desktop (1280px - xl breakpoint)

**Screenshot**: [responsive-1280px.png]

**Status**: ✅ PASS

**Findings**:
- ✅ Content centered with max-width
- ✅ 3-column grid displays properly
- ✅ Typography scaled appropriately
- ✅ All interactive elements sized correctly

---

### Large Desktop (1920px - 2xl breakpoint)

**Screenshot**: [responsive-1920px.png]

**Status**: ⚠️ WARNING

**Findings**:
- ⚠️ Content not centered, excessive whitespace
- ✅ No overflow
- ℹ️ Consider max-width container

**Recommendation**:
```tsx
<main className="container mx-auto max-w-7xl px-4">
  {/* Prevents excessive whitespace on ultra-wide screens */}
</main>
```

---

## Touch Target Violations (Mobile)

| Element | Current Size | Location | Required | Fix |
|---------|-------------|----------|----------|-----|
| Edit icon | 32×32px | UserActions.tsx:34 | 44×44px | `h-12 w-12 sm:h-9 sm:w-9` |
| Delete icon | 32×32px | UserActions.tsx:45 | 44×44px | `h-12 w-12 sm:h-9 sm:w-9` |
| Filter dropdown | 36×36px | UserFilters.tsx:23 | 44×44px | `h-11 w-11 sm:h-9 sm:w-9` |

---

## Mobile-First Pattern Analysis

### ✅ Good Mobile-First Patterns

**Line 67** (src/components/HeroSection.tsx):
```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:gap-6 lg:gap-8">
```
✅ Starts with mobile (flex-col), enhances for tablet/desktop

**Line 102** (src/components/Stats.tsx):
```tsx
<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
```
✅ Progressive font size scaling

---

### ⚠️ Desktop-First Anti-Patterns

**Line 45** (src/components/OldComponent.tsx):
```tsx
<div className="flex flex-row gap-8 md:flex-col md:gap-4">
```

❌ Starts with desktop layout (flex-row), then breaks down for mobile

**Mobile-First Fix**:
```tsx
<div className="flex flex-col gap-4 md:flex-row md:gap-8">
{/* Mobile: vertical stack, Desktop: horizontal */}
```

---

## Breakpoint Consistency

### Text Size Scaling

**Pattern A** (Hero, About sections):
- Base: `text-2xl`
- sm: `sm:text-3xl`
- lg: `lg:text-4xl`

**Pattern B** (Services section):
- Base: `text-xl`
- sm: `sm:text-2xl`
- md: `md:text-3xl`

ℹ️ **Recommendation**: Standardize on Pattern A for consistency across similar heading levels

---

### Spacing Progression

**Consistent Pattern** ✅:
- Mobile: `gap-4` (16px)
- Tablet: `sm:gap-6` (24px)
- Desktop: `lg:gap-8` (32px)

Used consistently across: Hero, Services, Team, Portfolio

---

## Overflow Issues

### Horizontal Scroll Detection

✅ **No horizontal overflow detected** at any viewport size

Tested viewports: 375px, 640px, 768px, 1024px, 1280px, 1920px

---

## Typography Readability

### Font Size Matrix

| Viewport | Body Text | Headings h1 | Headings h2 | Status |
|----------|-----------|-------------|-------------|--------|
| 375px (Mobile) | 16px | 24px | 20px | ✅ Readable |
| 640px (Tablet) | 16px | 30px | 24px | ✅ Good |
| 1280px (Desktop) | 16px | 36px | 30px | ✅ Excellent |

✅ All text meets minimum readability standards (≥16px on mobile)

---

## Responsive Images

### Image Loading Analysis

**Optimized** ✅:
- Line 45: `<img>` has width/height attributes (prevents CLS)
- Line 67: Uses `loading="lazy"` for below-fold images
- Line 89: Responsive with `className="w-full h-auto"`

**Needs Optimization** ⚠️:
```tsx
// Line 102: Missing dimensions
<img src="/large-image.jpg" alt="Description" />

// Recommended
<img
  src="/large-image.jpg"
  width={1200}
  height={800}
  className="w-full h-auto"
  loading="lazy"
  alt="Description"
/>
```

---

## Layout Behavior Summary

| Feature | Mobile (375px) | Tablet (768px) | Desktop (1280px) |
|---------|----------------|----------------|------------------|
| Navigation | Hamburger menu | Hamburger | Full menu |
| Grid | 1 column | 2 columns | 3 columns |
| Sidebar | Hidden | Shown (33%) | Shown (25%) |
| Images | Full width | Constrained | Max 1200px |
| Typography | Base size | +2px | +4px |

---

## Recommendations

### Priority 1: Fix Touch Targets (Mobile UX)
Increase button sizes on mobile to meet 44×44px minimum:
```tsx
<Button size="icon" className="h-12 w-12 sm:h-9 sm:w-9">
  {/* 48×48px mobile, 36×36px desktop */}
</Button>
```

**Impact**: Better mobile usability, WCAG Level AAA compliance

---

### Priority 2: Add Container Max-Width (Large Screens)
Prevent excessive whitespace on ultra-wide displays:
```tsx
<main className="container mx-auto max-w-7xl px-4">
  Content
</main>
```

**Impact**: Better content readability on 1920px+ screens

---

### Priority 3: Standardize Breakpoint Patterns
Align text size scaling across all sections:
- Use consistent `text-2xl sm:text-3xl lg:text-4xl` for h1 elements
- Use consistent spacing progression (gap-4, sm:gap-6, lg:gap-8)

**Impact**: Consistent user experience, easier maintenance

---

## Viewport Comparison

**Side-by-side Screenshots**:
- Mobile vs Desktop: [comparison-mobile-desktop.png]
- Tablet vs Desktop: [comparison-tablet-desktop.png]

**Key Observations**:
1. Layout transforms smoothly across breakpoints
2. No content gets cut off or becomes inaccessible
3. Visual hierarchy maintained at all sizes

---

## Testing Summary

**Automated Checks**: ✅
- Horizontal overflow detection
- Touch target size validation
- Text readability verification
- Image optimization check

**Manual Validation**: ✅
- Visual review of all screenshots
- Breakpoint transition smoothness
- Layout consistency

**Browser**: Chromium (Playwright)
**Viewports Tested**: 6
**Screenshots Generated**: 6
**Date**: {timestamp}

---

## Next Steps

1. **Fix Touch Targets** (15 min)
   - Update 3 button components to h-12 w-12 on mobile

2. **Add Container Constraints** (5 min)
   - Wrap content in max-w-7xl container for large screens

3. **Optimize Images** (10 min)
   - Add width/height to 2 images missing dimensions

4. **Re-test Responsive Behavior**:
   ```bash
   /responsive-check --browser true
   ```

5. **Test on Real Devices**:
   - Physical iPhone (Safari)
   - Physical Android (Chrome)
   - iPad (Safari)

---

**Report generated by**: Senior UI/UX Designer 2026 Plugin
**Standards**: Mobile-first, WCAG 2.5.5 Touch Targets, Responsive Images
**Method**: Static analysis + Playwright multi-viewport testing
```

---

## Tools to Use

- **Read**: Load file for static analysis
- **Grep**: Search for responsive class patterns, touch target sizes
- **Playwright MCP** (if browser=true):
  - `browser_navigate`: Load page
  - `browser_resize`: Test each viewport
  - `browser_take_screenshot`: Capture viewport screenshots
  - `browser_evaluate`: Check overflow, measure elements
- **Bash**: Check if dev server is running

---

Provide detailed, viewport-specific analysis with screenshots, touch target validation, and mobile-first pattern checking. Prioritize fixes that improve mobile usability and cross-device consistency.

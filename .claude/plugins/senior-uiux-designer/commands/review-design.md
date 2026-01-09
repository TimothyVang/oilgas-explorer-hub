---
name: review-design
description: Comprehensive UI/UX design review for components with detailed analysis and code examples
arguments:
  - name: target
    description: File path or directory to review (defaults to current file or recently changed files)
    type: string
    required: false
  - name: focus
    description: Focus area - all, ui, accessibility, responsive, or performance
    type: string
    default: all
    required: false
examples:
  - /review-design
  - /review-design src/components/Hero.tsx
  - /review-design src/components/admin --focus accessibility
  - /review-design --focus performance
---

Perform a comprehensive senior-level UI/UX design review with detailed analysis, specific line numbers, and actionable code examples.

## Implementation Steps

### 1. Identify Target Files

If `target` argument provided:
- Use that specific file or directory path
- Use Glob to find all `.tsx`, `.jsx` files in the target

If no `target` provided:
- Check if there's a currently open file in the editor
- Fall back to finding recently changed files with Git:
  ```bash
  git diff --name-only HEAD~1..HEAD | grep -E '\.(tsx|jsx)$'
  ```

### 2. Load and Parse Component Files

For each target file:
1. Use Read tool to load the file contents
2. Extract component structure:
   - Component name (look for `export const` or `export default`)
   - Props interface (TypeScript types)
   - State variables (`useState`, `useReducer`)
   - Event handlers (`onClick`, `onSubmit`, `onChange`, `onKeyDown`)
   - Conditional rendering patterns
   - Mapped/iterated elements (lists)
3. Extract styling information:
   - Tailwind classes in `className` attributes
   - Inline styles in `style` prop
   - Component variants (cva patterns)

### 3. Analyze Based on Focus Area

#### If focus=all or focus=ui (Modern UI Patterns)

Reference: **modern-ui-patterns-2026.md** and **tailwind-shadcn-patterns.md** skills

**Check for:**

1. **Design Token Usage**:
   - Use Grep to find hardcoded colors: `#[0-9A-Fa-f]{3,6}`
   - Use Grep to find hardcoded sizes: `w-\[[\d]+px\]` or `text-\[[\d]+px\]`
   - Flag violations and suggest token alternatives

2. **Component Pattern Consistency**:
   - Compare button variants to shadcn pattern (default, outline, hero, glass)
   - Check if similar components use consistent styling
   - Validate spacing consistency (gap-4, gap-6, not gap-[13px])

3. **Visual Hierarchy**:
   - Check heading hierarchy (h1 → h2 → h3, no skips)
   - Validate font family usage (font-heading for headings, font-body for text)
   - Check typography scale (text-4xl for h1, text-3xl for h2, etc.)

4. **Micro-Interactions**:
   - Check for hover states (hover:scale-105, hover:shadow-lg)
   - Verify focus states (focus-visible:ring-2)
   - Validate transition timing (transition-all duration-300)

5. **2026 Modern Patterns**:
   - Identify opportunities for glassmorphism (backdrop-blur)
   - Check gradient usage
   - Validate animation sophistication

**Generate Issues**:
- For each violation, note file path and approximate line number
- Provide "Current Code" example
- Provide "Recommended Fix" with proper tokens

#### If focus=all or focus=accessibility (WCAG Compliance)

Reference: **accessibility-standards.md** and **wcag-compliance-guide.md** skills

**Check for:**

1. **Semantic HTML**:
   - Use Grep to find `<div onClick` or `<span onClick` (should be `<button>`)
   - Check for proper use of `<nav>`, `<main>`, `<article>`, `<section>`
   - Validate heading hierarchy

2. **ARIA Attributes**:
   - Use Grep to find buttons without text: `<[Bb]utton[^>]*>[\s]*<[A-Z]` (icon-only)
   - Check these have `aria-label` or `aria-labelledby`
   - Find `aria-expanded`, `aria-controls` on disclosure buttons
   - Check `role` attributes are used correctly

3. **Keyboard Navigation**:
   - Use Grep to find `onClick` without `onKeyDown` on non-button elements
   - Check custom interactive elements have `tabIndex={0}`
   - Verify modal dialogs have focus trap (if using Dialog component)

4. **Color Contrast**:
   - Parse Tailwind classes to extract colors
   - Map to HSL values from tailwind.config.ts (reference tailwind-shadcn-patterns.md)
   - Calculate contrast ratios
   - Flag violations < 4.5:1 for text, < 3:1 for UI components

5. **Form Accessibility**:
   - Use Grep to find `<[Ii]nput` elements
   - Check each has associated `<[Ll]abel htmlFor` or `aria-label`
   - Verify required fields have `required` attribute
   - Check error messages use `aria-describedby`

6. **Image Alt Text**:
   - Use Grep to find `<img` tags
   - Check each has `alt` attribute
   - Flag missing alt text as Critical

**Generate Issues**:
- Categorize by WCAG severity (Critical = Level A, High = Level AA, Medium = Level AAA)
- Provide WCAG criterion reference (e.g., "3.3.2 Labels or Instructions - Level A")
- Show current code and accessible fix

#### If focus=all or focus=responsive (Mobile-First Patterns)

Reference: **responsive-design-best-practices.md** skill

**Check for:**

1. **Mobile-First Implementation**:
   - Parse Tailwind responsive classes
   - Verify base styles work on mobile
   - Check progressive enhancement with sm:, md:, lg: prefixes
   - Flag desktop-first patterns (e.g., `flex-row sm:flex-col`)

2. **Touch Target Sizes**:
   - Use Grep to find button/link elements
   - Parse size classes (h-8, w-8, etc.)
   - Calculate pixel sizes (h-8 = 32px)
   - Flag violations < 44px for mobile interactive elements

3. **Breakpoint Consistency**:
   - Collect all responsive class usage
   - Check for consistent breakpoint usage across similar components
   - Validate spacing adjustments follow pattern (gap-4, md:gap-6, lg:gap-8)

4. **Typography Scaling**:
   - Check headings have responsive text sizes
   - Verify minimum 16px (text-base) for body text on mobile

5. **Flexible Layouts**:
   - Check for fixed widths (w-[600px]) that might overflow
   - Validate grid/flexbox usage
   - Check for max-width with centering (max-w-7xl mx-auto)

**Generate Issues**:
- Note viewport where issue occurs (Mobile <640px, Tablet 640-1024px, Desktop >1024px)
- Provide responsive code fix with breakpoint variants

#### If focus=all or focus=performance (Frontend Performance)

Reference: **performance-optimization.md** skill

**Check for:**

1. **Animation Performance**:
   - Use Grep to find Framer Motion usage: `motion\.` or `<motion\.`
   - Extract animated properties from `animate=` props
   - Flag non-performant properties (width, height, top, left, margin, padding)
   - Recommend transform/opacity alternatives

2. **Image Optimization**:
   - Use Grep to find image tags: `<img`
   - Check for:
     - Modern formats (srcSet with .avif or .webp)
     - Lazy loading (`loading="lazy"`)
     - Width/height attributes (prevent CLS)
   - Flag large images without optimization

3. **Layout Shift Risks**:
   - Find images without width/height
   - Check for dynamic content without skeleton loaders
   - Identify potential CLS issues

4. **Bundle Size Concerns**:
   - Use Grep to find heavy imports: `import.*from ['"]lodash['"]` (entire library)
   - Suggest individual function imports
   - Identify opportunities for code splitting

**Generate Issues**:
- Categorize by performance impact (Critical, High, Medium, Low)
- Provide optimized code example
- Explain performance benefit (e.g., "60fps vs 30fps")

### 4. Generate Comprehensive Report

Format the output as a detailed markdown report:

```markdown
# 🎨 UI/UX Design Review Report

## Executive Summary
- **Files Reviewed**: {count}
- **Overall Score**: {score}/10
- **Critical Issues**: {count}
- **High Priority**: {count}
- **Medium Priority**: {count}
- **Low Priority**: {count}

---

## Critical Issues

### 1. [Issue Title] - {file-path}:{line}
**Category**: {Accessibility|Design|Performance|Responsive}
**Priority**: CRITICAL
**Impact**: {Why this matters to users}

**Current Code**:
```tsx
{actual code snippet}
```

**Recommended Fix**:
```tsx
{improved code snippet}
```

**Why**: {Technical explanation of improvement}

---

### 2. [Next Issue]...

---

## High Priority Issues

[Same format as Critical...]

---

## Medium Priority Issues

[Same format...]

---

## Low Priority Issues / Suggestions

[Same format...]

---

## 2026 Enhancement Opportunities

- Consider implementing scroll-driven animations for hero section
- Add command palette (Cmd+K) for power users
- Implement container queries for responsive cards
- Upgrade to AVIF image format for 30% smaller file sizes

---

## Positive Highlights

✅ Excellent use of shadcn-ui component variants
✅ Consistent design token usage throughout
✅ Good animation performance with transform-based animations
✅ Proper ARIA labels on interactive elements

---

## Next Steps

1. Address Critical issues immediately (WCAG violations, broken functionality)
2. Plan fixes for High Priority issues (contrast, keyboard nav, responsive)
3. Consider Medium Priority enhancements for polish
4. Run `/accessibility-audit --browser true` for deeper testing
5. Run `/responsive-check --browser true` for viewport validation

---

## Summary

{Overall assessment paragraph: What's working well, what needs attention, overall design quality}
```

### 5. Scoring Algorithm

```typescript
// Calculate overall score (0-10)
const maxScore = 10;
const criticalWeight = 0.5;    // Critical issues reduce score by 0.5 each
const highWeight = 0.2;         // High issues reduce score by 0.2 each
const mediumWeight = 0.1;       // Medium issues reduce score by 0.1 each

let score = maxScore;
score -= (criticalCount * criticalWeight);
score -= (highCount * highWeight);
score -= (mediumCount * mediumWeight);
score = Math.max(0, Math.min(10, score));  // Clamp to 0-10
```

---

## Tools to Use

- **Glob**: Find target files (`**/*.tsx`, `**/*.jsx`)
- **Read**: Load file contents for analysis
- **Grep**: Search for specific patterns (ARIA, hardcoded colors, animations, etc.)
- **Bash**: Git commands to find changed files if needed

---

## Important Notes

1. **Be Specific**: Always include file paths and line numbers
2. **Show Code**: Provide actual code snippets, not descriptions
3. **Explain Impact**: Why does this issue matter to users?
4. **Prioritize Correctly**:
   - Critical: Breaks functionality, WCAG Level A violations, severe accessibility issues
   - High: WCAG Level AA violations, poor UX, performance problems
   - Medium: WCAG Level AAA, design inconsistencies, minor issues
   - Low: Suggestions, optimizations, nice-to-haves
5. **Be Constructive**: Balance critique with positive feedback
6. **Reference Skills**: Use the knowledge from all 6 skills to inform analysis

---

When performing the review, act as a senior UI/UX designer with expertise in modern web standards, accessibility, and performance. Provide actionable, specific feedback that helps developers improve their code quality and user experience.

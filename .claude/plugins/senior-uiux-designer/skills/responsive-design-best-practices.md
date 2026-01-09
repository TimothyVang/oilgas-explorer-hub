# Responsive Design Best Practices Skill

This skill should be used when evaluating components for responsive design, mobile-first methodology, breakpoint strategy, touch target accessibility, and fluid layouts. Apply when reviewing component responsiveness, validating mobile experiences, and ensuring cross-device compatibility.

## Mobile-First Methodology

### Core Principle

Design for mobile first, then progressively enhance for larger screens.

**Mobile-First Benefits**:
- Forces focus on essential content and features
- Better performance (smaller initial payload)
- Easier to enhance than to strip down
- Aligns with majority mobile traffic (2026)

**Implementation Pattern**:
```tsx
// Mobile-first: Base styles for mobile, enhance for larger screens
<div className="
  flex flex-col gap-4      {/* Mobile: Vertical stack */}
  sm:flex-row sm:gap-6     {/* Tablet: Horizontal */}
  lg:gap-8                 {/* Desktop: More spacing */}
">
  Content
</div>

// Bad: Desktop-first (avoid)
<div className="
  flex flex-row gap-8      {/* Assumes desktop */}
  sm:flex-col sm:gap-4     {/* Breaks on mobile */}
">
```

---

## Tailwind Breakpoint Strategy

### Standard Breakpoints

```typescript
breakpoints: {
  sm: '640px',   // Tablets (portrait)
  md: '768px',   // Tablets (landscape) / Small laptops
  lg: '1024px',  // Laptops / Desktops
  xl: '1280px',  // Large desktops
  '2xl': '1536px' // Extra large displays
}
```

### Breakpoint Usage Best Practices

**Typography Scaling**
```tsx
<h1 className="
  text-2xl      {/* Mobile: 24px */}
  sm:text-3xl   {/* Tablet: 30px */}
  lg:text-4xl   {/* Desktop: 36px */}
  xl:text-5xl   {/* Large: 48px */}
  font-bold leading-tight
">
  Responsive Heading
</h1>
```

**Layout Transitions**
```tsx
// Single column → Two column → Three column
<div className="
  grid grid-cols-1 gap-4        {/* Mobile: 1 column */}
  md:grid-cols-2 md:gap-6       {/* Tablet: 2 columns */}
  lg:grid-cols-3 lg:gap-8       {/* Desktop: 3 columns */}
">
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</div>
```

**Spacing Adjustments**
```tsx
<section className="
  py-8 px-4           {/* Mobile: 32px vertical, 16px horizontal */}
  md:py-12 md:px-6    {/* Tablet: 48px vertical, 24px horizontal */}
  lg:py-16 lg:px-8    {/* Desktop: 64px vertical, 32px horizontal */}
">
  Content
</section>
```

**Visibility Controls**
```tsx
// Show/hide based on breakpoint
<div>
  {/* Mobile navigation */}
  <button className="md:hidden">
    <Menu />
  </button>

  {/* Desktop navigation */}
  <nav className="hidden md:flex md:gap-6">
    <Link>Home</Link>
    <Link>About</Link>
  </nav>
</div>
```

---

## Touch Target Accessibility

### Minimum Touch Target Sizes

**WCAG 2.2 Level AAA**: 44×44 CSS pixels minimum

```tsx
// Good: Adequate touch targets for mobile
<Button className="h-11 w-11 sm:h-9 sm:w-9">
  <Settings className="h-5 w-5" />
</Button>

// Bad: Too small for touch
<Button className="h-6 w-6">  {/* 24×24px - too small! */}
  <Settings className="h-4 w-4" />
</Button>
```

**Responsive Touch Target Pattern**:
```tsx
// Larger on mobile, can be smaller on desktop (mouse precision)
<button className="
  h-12 w-12 p-3        {/* Mobile: 48×48px */}
  sm:h-10 sm:w-10 sm:p-2  {/* Desktop: 40×40px */}
">
  <Icon />
</button>
```

### Touch Target Spacing

**Minimum Spacing**: 8px between touch targets

```tsx
// Good: Adequate spacing
<div className="flex gap-2">  {/* 8px between buttons */}
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>

// Better: More comfortable spacing on mobile
<div className="flex gap-3 sm:gap-2">  {/* 12px mobile, 8px desktop */}
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

---

## Container Queries (2026 Standard)

### Component-Level Responsiveness

Unlike viewport breakpoints, container queries allow components to respond to their *parent container's* width.

**Setup** (Tailwind CSS with `@tailwindcss/container-queries` plugin):
```tsx
// Mark container
<div className="@container">
  {/* Child responds to parent width, not viewport */}
  <Card className="
    p-4 @sm:p-6 @md:p-8
    @lg:grid @lg:grid-cols-2 @lg:gap-6
  ">
    Content adapts to card width, not screen width
  </Card>
</div>
```

**Use Cases**:
- Sidebar components (adapt when sidebar is narrow/wide)
- Reusable cards (same card component works in different containers)
- Dashboard widgets (responsive to panel size)

---

## Fluid Typography and Spacing

### clamp() for Responsive Scaling

```css
/* Fluid font size: scales smoothly between viewport sizes */
font-size: clamp(
  1rem,           /* Minimum size (16px) */
  2vw + 0.5rem,   /* Ideal size (viewport-based) */
  2rem            /* Maximum size (32px) */
);
```

```tsx
// Tailwind custom utility
<h1 className="text-fluid-2xl">
  Scales smoothly from 24px to 48px
</h1>

// tailwind.config.ts
theme: {
  extend: {
    fontSize: {
      'fluid-2xl': 'clamp(1.5rem, 2vw + 1rem, 3rem)',
    }
  }
}
```

### Fluid Spacing

```tsx
// Using Tailwind spacing with breakpoint variants
<section className="py-[clamp(2rem,5vw,4rem)]">
  Scales padding based on viewport
</section>
```

---

## Responsive Images

### Modern Image Patterns

**1. Responsive Image Sizes** (`srcset` and `sizes`)
```tsx
<img
  src="/images/hero-800.jpg"
  srcSet="
    /images/hero-400.jpg 400w,
    /images/hero-800.jpg 800w,
    /images/hero-1200.jpg 1200w,
    /images/hero-1600.jpg 1600w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 80vw,
    1200px
  "
  alt="Hero image"
  width={1200}
  height={800}
  loading="lazy"
/>
```

**2. Modern Image Formats** (WebP, AVIF)
```tsx
<picture>
  <source srcSet="/images/hero.avif" type="image/avif" />
  <source srcSet="/images/hero.webp" type="image/webp" />
  <img src="/images/hero.jpg" alt="Hero image" />
</picture>
```

**3. Responsive Background Images**
```tsx
<div className="
  bg-cover bg-center
  min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]
" style={{
  backgroundImage: `url('/images/hero-${screenSize}.jpg')`
}}>
  Content
</div>
```

**4. Aspect Ratio Boxes** (Prevent layout shift)
```tsx
<div className="aspect-video w-full">  {/* 16:9 ratio */}
  <img src="/video-thumbnail.jpg" className="w-full h-full object-cover" />
</div>

<div className="aspect-square">  {/* 1:1 ratio */}
  <img src="/profile.jpg" className="w-full h-full object-cover" />
</div>
```

---

## Mobile Navigation Patterns

### Hamburger Menu (Mobile) → Full Nav (Desktop)

```tsx
export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav>
      {/* Mobile: Hamburger button */}
      <button
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile: Full-screen overlay menu */}
      {mobileMenuOpen && (
        <div className="
          fixed inset-0 z-50
          bg-background
          md:hidden
        ">
          <ul className="flex flex-col gap-8 p-8">
            <li><Link onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
            <li><Link onClick={() => setMobileMenuOpen(false)}>About</Link></li>
          </ul>
        </div>
      )}

      {/* Desktop: Horizontal nav */}
      <ul className="hidden md:flex md:gap-6">
        <li><Link>Home</Link></li>
        <li><Link>About</Link></li>
      </ul>
    </nav>
  );
}
```

### Mobile-Optimized Form Layouts

```tsx
// Stacked on mobile, side-by-side on desktop
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="first-name">First Name</Label>
      <Input id="first-name" />
    </div>
    <div>
      <Label htmlFor="last-name">Last Name</Label>
      <Input id="last-name" />
    </div>
  </div>
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" className="w-full" />
  </div>
</form>
```

---

## Common Responsive Issues and Fixes

### Issue 1: Horizontal Overflow on Mobile

**Problem**: Content overflows viewport width
```tsx
<div className="w-[600px]">  {/* Fixed width - overflows on mobile! */}
  Content
</div>
```

**Fix**: Use max-width or responsive widths
```tsx
<div className="w-full max-w-2xl mx-auto px-4">
  Content scales to viewport
</div>
```

### Issue 2: Unreadable Text on Mobile

**Problem**: Text too small or too large
```tsx
<p className="text-xs">Tiny text - hard to read on mobile</p>
```

**Fix**: Minimum 16px font size for body text
```tsx
<p className="text-base sm:text-sm">
  Readable on mobile (16px), can be smaller on desktop
</p>
```

### Issue 3: Touch Targets Too Small

**Problem**: Buttons < 44×44px
```tsx
<button className="h-8 w-8">  {/* 32×32px - too small for touch! */}
  <Icon />
</button>
```

**Fix**: Larger on mobile, can be smaller on desktop
```tsx
<button className="h-12 w-12 sm:h-9 sm:w-9">
  <Icon />
</button>
```

### Issue 4: Images Without Dimensions (Layout Shift)

**Problem**: Images load and push content down
```tsx
<img src="/image.jpg" alt="Description" />
```

**Fix**: Always provide width/height or aspect ratio
```tsx
<img
  src="/image.jpg"
  alt="Description"
  width={1200}
  height={800}
  className="w-full h-auto"  {/* Maintains aspect ratio */}
/>
```

### Issue 5: Desktop-Only Features

**Problem**: Hover states don't work on mobile
```tsx
<div className="hover:bg-accent">
  Only works with mouse hover
</div>
```

**Fix**: Provide touch-friendly alternatives
```tsx
<button
  onClick={handleClick}  {/* Works on mobile */}
  className="hover:bg-accent active:bg-accent"  {/* Active for mobile tap */}
>
  Works on touch and mouse
</button>
```

---

## Testing Checklist

### Desktop Testing (Chrome DevTools)

1. **Responsive Mode**: Toggle device toolbar (Cmd/Ctrl + Shift + M)
2. **Test Viewports**:
   - Mobile: 375px (iPhone SE), 390px (iPhone 12/13), 414px (iPhone Plus)
   - Tablet: 768px (iPad), 820px (iPad Air), 1024px (iPad Pro)
   - Desktop: 1280px, 1440px, 1920px
3. **Rotate**: Test portrait and landscape
4. **Network Throttling**: Slow 3G/4G (mobile performance)
5. **Touch Simulation**: Enable touch events

### Manual Device Testing

- Test on at least one physical mobile device
- Check touch target accessibility (actual finger presses)
- Validate scroll behavior (momentum, bounce)
- Test form inputs (virtual keyboard doesn't obscure fields)

### Automated Testing

```bash
# Playwright responsive testing
npx playwright test --project=mobile
npx playwright test --project=tablet
npx playwright test --project=desktop
```

---

## Quick Evaluation Checklist

- [ ] **Mobile-First**: Base styles work on mobile, enhanced for desktop
- [ ] **Breakpoints**: Uses standard Tailwind breakpoints (sm, md, lg, xl)
- [ ] **Touch Targets**: ≥44×44px on mobile for buttons/links
- [ ] **Touch Spacing**: ≥8px between interactive elements
- [ ] **Typography**: Minimum 16px for body text on mobile
- [ ] **Images**: Have width/height to prevent layout shift
- [ ] **Navigation**: Mobile-friendly menu (hamburger or bottom nav)
- [ ] **Forms**: Stack on mobile, side-by-side on desktop
- [ ] **Overflow**: No horizontal scroll on mobile
- [ ] **Readable**: Content readable at all viewport sizes

Use this skill to validate responsive design patterns, ensure mobile-first implementation, and identify issues across device sizes.

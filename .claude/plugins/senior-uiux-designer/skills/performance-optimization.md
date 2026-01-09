# Performance Optimization Skill

This skill should be used when analyzing components for frontend performance, animation efficiency, image optimization, layout stability, and bundle size. Apply when reviewing animations, evaluating page load performance, and ensuring 60fps rendering for 2026 Core Web Vitals standards.

## Core Web Vitals (2026 Standards)

### Performance Metrics

**Largest Contentful Paint (LCP)** - Largest content element renders
- Good: < 2.5 seconds
- Needs Improvement: 2.5 - 4.0 seconds
- Poor: > 4.0 seconds

**Interaction to Next Paint (INP)** - Replaced FID in 2024, now standard in 2026
- Good: < 200 milliseconds
- Needs Improvement: 200 - 500 milliseconds
- Poor: > 500 milliseconds

**Cumulative Layout Shift (CLS)** - Visual stability
- Good: < 0.1
- Needs Improvement: 0.1 - 0.25
- Poor: > 0.25

---

## Animation Performance

### GPU-Accelerated Properties (60fps)

**Safe to Animate** (Composite layer, no layout/paint):
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (with caution)

```tsx
// Good: Smooth 60fps animation
<motion.div
  animate={{ x: 100, opacity: 0.5 }}  {/* transform + opacity */}
  transition={{ duration: 0.3 }}
>
  Smooth animation
</motion.div>

// Good: Scale animation
<Button className="hover:scale-105 transition-transform duration-200">
  Smooth hover
</Button>
```

**Expensive to Animate** (Trigger layout/paint, 30fps or worse):
- `width`, `height`
- `top`, `left`, `right`, `bottom` (use `transform: translate` instead)
- `margin`, `padding`
- `border-width`
- `font-size` (layout recalculation)

```tsx
// Bad: Causes layout recalculation every frame
<motion.div
  animate={{ width: 400, height: 300 }}  {/* 30fps */}
>
  Janky animation
</motion.div>

// Good: Use transform instead
<motion.div
  animate={{ scaleX: 1.33, scaleY: 1.5 }}  {/* 60fps */}
  style={{ transformOrigin: 'left top' }}
>
  Smooth animation
</motion.div>
```

### will-change Optimization

```css
/* Tell browser to optimize for animation */
.will-animate {
  will-change: transform, opacity;
}

/* Remove after animation complete */
.animation-done {
  will-change: auto;
}
```

```tsx
// Framer Motion handles will-change automatically
<motion.div
  animate={{ x: 100 }}
  // Automatically adds will-change: transform during animation
>
  Optimized
</motion.div>
```

**will-change Best Practices**:
- Only use for elements that *will* animate
- Remove after animation completes
- Don't apply to too many elements (memory overhead)
- Browser creates new composite layer (use sparingly)

### Animation Duration Best Practices

```typescript
// UI feedback: Fast and snappy
transition: { duration: 0.15 }  // Button press, toggle

// Standard interactions: Balanced
transition: { duration: 0.3 }   // Hover effects, dropdowns

// Entrance animations: Noticeable but not slow
transition: { duration: 0.5 }   // Modal appear, page transitions

// Avoid: Too slow
transition: { duration: 1.0 }   // User waits too long
```

### Framer Motion Performance Patterns

**Layout Animations** (Automatic but can be expensive)
```tsx
// Expensive: Recalculates layout on every frame
<motion.div layout>
  <motion.div layout>Child 1</motion.div>
  <motion.div layout>Child 2</motion.div>
</motion.div>

// Better: Use layoutId for specific elements
<motion.div layoutId="card">
  Smoothly animates position changes
</motion.div>
```

**Reduce Motion Overhead**
```tsx
// Skip animations for static content
<motion.div
  initial={false}  // Skip initial animation
  animate={{ opacity: 1 }}
>
  Static content
</motion.div>

// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.5
  }}
>
  Accessible animation
</motion.div>
```

---

## Image Optimization

### Modern Image Formats

**Format Priority** (2026 standard):
1. **AVIF** - Best compression, wide support in 2026
2. **WebP** - Excellent compression, universal support
3. **JPEG/PNG** - Fallback for older browsers

```tsx
<picture>
  <source srcSet="/image.avif" type="image/avif" />
  <source srcSet="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="Description" loading="lazy" />
</picture>
```

### Image Sizing and Compression

**Compression Targets**:
- Hero images: < 500KB (AVIF/WebP)
- Content images: < 200KB
- Thumbnails: < 50KB
- Icons: Use SVG when possible

**Responsive Images**:
```tsx
<img
  src="/image-800.avif"
  srcSet="
    /image-400.avif 400w,
    /image-800.avif 800w,
    /image-1200.avif 1200w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 80vw,
    1200px
  "
  alt="Description"
  width={1200}
  height={800}
  loading="lazy"
/>
```

### Lazy Loading

```tsx
// Native lazy loading (widely supported in 2026)
<img src="/image.jpg" loading="lazy" alt="Description" />

// Lazy load below-the-fold images
<img
  src="/hero.jpg"
  loading="eager"  {/* Above fold - load immediately */}
  alt="Hero"
/>

<img
  src="/content.jpg"
  loading="lazy"  {/* Below fold - defer until near viewport */}
  alt="Content"
/>
```

### Image Dimensions (Prevent CLS)

```tsx
// Always provide dimensions
<img
  src="/image.jpg"
  width={1200}  {/* Intrinsic width */}
  height={800}  {/* Intrinsic height */}
  className="w-full h-auto"  {/* Responsive */}
  alt="Description"
/>

// Or use aspect-ratio
<div className="aspect-video w-full">
  <img src="/video-thumb.jpg" className="w-full h-full object-cover" />
</div>
```

---

## Layout Stability (Preventing CLS)

### Common CLS Causes and Fixes

**1. Images Without Dimensions**
```tsx
// Bad: Causes CLS when image loads
<img src="/image.jpg" alt="Description" />

// Good: Reserves space
<img
  src="/image.jpg"
  width={1200}
  height={800}
  className="w-full h-auto"
  alt="Description"
/>
```

**2. Dynamic Content Loading**
```tsx
// Bad: Content shifts when loaded
{isLoading ? null : <ArticleContent />}

// Good: Reserve space with skeleton
{isLoading ? (
  <div className="space-y-3">
    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
  </div>
) : (
  <ArticleContent />
)}
```

**3. Web Fonts Causing Layout Shift**
```css
/* Add to global CSS */
@font-face {
  font-family: 'Montserrat';
  src: url('/fonts/montserrat.woff2') format('woff2');
  font-display: swap;  /* Fallback font until custom font loads */
}
```

**4. Ads and Embeds**
```tsx
// Reserve space for ad container
<div className="min-h-[250px] bg-muted">
  <AdComponent />
</div>
```

**5. Animations on Mount**
```tsx
// Bad: Element pops in, shifts layout
<motion.div
  initial={{ y: -20 }}  {/* Shifts from above */}
  animate={{ y: 0 }}
>
  Content
</motion.div>

// Good: Fade in without shifting position
<motion.div
  initial={{ opacity: 0 }}  {/* Only opacity change */}
  animate={{ opacity: 1 }}
>
  Content
</motion.div>
```

### Skeleton Loaders (Best Practice for CLS)

```tsx
// Skeleton matches loaded content dimensions
export function ArticleSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 bg-muted rounded w-3/4"></div>

      {/* Meta skeleton */}
      <div className="flex gap-4">
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-4 bg-muted rounded w-32"></div>
      </div>

      {/* Content skeletons */}
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  );
}

// Usage
{isLoading ? <ArticleSkeleton /> : <Article data={data} />}
```

---

## Bundle Size Optimization

### Code Splitting

**Route-Based Splitting** (React Router + Vite)
```tsx
import { lazy, Suspense } from 'react';

// Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

**Component-Based Splitting**
```tsx
// Heavy component loaded only when needed
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading chart...</div>}>
        {showChart && <HeavyChart />}
      </Suspense>
    </div>
  );
}
```

### Tree Shaking

```tsx
// Bad: Imports entire library
import _ from 'lodash';  // Entire lodash bundle (~70KB)
_.debounce(fn, 300);

// Good: Import only what you need
import debounce from 'lodash/debounce';  // Only debounce (~2KB)
debounce(fn, 300);

// Better: Use native or smaller alternatives
const debounce = (fn, ms) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};
```

### Analyzing Bundle Size

```bash
# Build and analyze
npm run build

# Check output
ls -lh dist/assets/*.js

# Use vite-plugin-visualizer to visualize bundle
npm install -D rollup-plugin-visualizer
```

**Vite Bundle Analysis**:
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
    }),
  ],
});
```

### Heavy Dependencies to Watch

- **Framer Motion**: ~60KB (gzipped) - Worth it for animations
- **Moment.js**: ~70KB - Replace with `date-fns` (~2KB per function)
- **Lodash**: ~70KB - Use native JS or import individual functions
- **Chart.js**: ~200KB - Consider lightweight alternatives (recharts, lightweight-charts)

---

## Network Performance

### Lazy Loading Third-Party Scripts

```tsx
// Defer non-critical scripts
useEffect(() => {
  // Load analytics after page interactive
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}, []);
```

### Prefetching and Preloading

```tsx
// Preload critical resources
<link rel="preload" href="/fonts/montserrat.woff2" as="font" type="font/woff2" crossOrigin />

// Prefetch likely next page
<link rel="prefetch" href="/dashboard" />

// Preconnect to external domains
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://api.example.com" />
```

---

## Rendering Performance

### Avoid Unnecessary Re-renders

```tsx
// Bad: Re-renders on every parent render
function ChildComponent({ data }) {
  return <div>{data.value}</div>;
}

// Good: Memoize to prevent re-renders
const ChildComponent = React.memo(({ data }) => {
  return <div>{data.value}</div>;
}, (prevProps, nextProps) => {
  return prevProps.data.value === nextProps.data.value;
});
```

### Expensive Calculations

```tsx
// Bad: Recalculates on every render
function Component({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return <div>Total: {total}</div>;
}

// Good: Memoize expensive calculation
function Component({ items }) {
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  );
  return <div>Total: {total}</div>;
}
```

### Virtualization for Long Lists

```tsx
// Bad: Renders 10,000 items (slow, memory intensive)
<div>
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>

// Good: Virtualize (only render visible items)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ItemCard {...items[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## Performance Measurement

### Browser DevTools Performance Tab

1. Open DevTools → Performance tab
2. Click Record → Interact with page → Stop
3. Analyze:
   - **FPS**: Should be 60fps during animations
   - **Main thread**: Look for long tasks (>50ms)
   - **Rendering**: Check for excessive paint/layout operations

### Lighthouse Audit

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:5173 --view

# Check scores:
# - Performance: > 90 (good)
# - Accessibility: > 90 (good)
# - Best Practices: > 90 (good)
```

### React DevTools Profiler

```tsx
import { Profiler } from 'react';

<Profiler id="Dashboard" onRender={(id, phase, actualDuration) => {
  if (actualDuration > 16) {  // More than one frame (16ms)
    console.warn(`${id} took ${actualDuration}ms to render`);
  }
}}>
  <Dashboard />
</Profiler>
```

---

## Performance Checklist

### Animations
- [ ] Only animate `transform` and `opacity` (60fps)
- [ ] Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding`
- [ ] Use `will-change` for complex animations (sparingly)
- [ ] Animation durations: 150-500ms (not >1s)
- [ ] Respect `prefers-reduced-motion`

### Images
- [ ] Use modern formats (AVIF > WebP > JPEG)
- [ ] Compress images (<500KB hero, <200KB content)
- [ ] Implement lazy loading for below-fold images
- [ ] Always provide width/height (prevent CLS)
- [ ] Use responsive images (`srcset`, `sizes`)

### Layout Stability
- [ ] No layout shifts (CLS < 0.1)
- [ ] Images have dimensions
- [ ] Fonts use `font-display: swap`
- [ ] Skeleton loaders for dynamic content
- [ ] Reserved space for ads/embeds

### Bundle Size
- [ ] Code splitting by route
- [ ] Lazy load heavy components
- [ ] Tree shaking enabled (Vite default)
- [ ] Import only needed functions (not entire libraries)
- [ ] Bundle size < 500KB (gzipped)

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1

Use this skill to identify performance bottlenecks, optimize animations for 60fps, and ensure components meet 2026 Core Web Vitals standards.

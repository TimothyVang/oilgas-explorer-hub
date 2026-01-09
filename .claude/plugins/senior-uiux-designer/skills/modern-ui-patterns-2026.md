# Modern UI Patterns 2026 Skill

This skill should be used when analyzing components for modern design trends, visual hierarchy, component consistency, micro-interactions, and cutting-edge 2026 UI patterns. Apply these patterns when reviewing design systems, evaluating component libraries, and suggesting design enhancements.

## Design Systems and Component Consistency

### Design Token Fundamentals

**Color Tokens** (HSL-based for flexibility)
```typescript
// Define semantic color tokens, not direct colors
const tokens = {
  colors: {
    primary: 'hsl(var(--primary))',           // Brand color
    secondary: 'hsl(var(--secondary))',       // Accent color
    accent: 'hsl(var(--accent))',             // Call-to-action
    muted: 'hsl(var(--muted))',               // Subtle backgrounds
    foreground: 'hsl(var(--foreground))',     // Primary text
    background: 'hsl(var(--background))',     // Page background
  }
};

// Good: Using design tokens
<Button className="bg-primary text-primary-foreground">Click</Button>

// Bad: Hardcoded colors
<Button className="bg-[#0066ff] text-white">Click</Button>
```

**Spacing Scale** (Consistent rhythm)
```typescript
// Use standardized spacing scale (Tailwind approach)
spacing: {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
}

// Prefer: gap-4, gap-6, gap-8
// Avoid: gap-[13px], gap-[27px]
```

**Typography Tokens**
```typescript
// Font families
fontFamily: {
  heading: ['Montserrat', 'sans-serif'],
  body: ['Open Sans', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}

// Type scale (modular scale 1.25)
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
}
```

### Component Variant Management

**Using CVA (Class Variance Authority)**
```typescript
// Modern approach with cva for consistent variants
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border-2 border-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Usage
<Button variant="outline" size="lg">Click Me</Button>
```

**Consistency Checks**
- All buttons use same variant system
- Similar components share visual patterns (Cards, Dialogs, Sheets)
- Spacing is consistent (same gap/padding values for similar layouts)
- Border radius consistent across component types

---

## Visual Hierarchy and Typography

### Typography Scale and Hierarchy

**Heading Hierarchy** (Clear visual distinction)
```tsx
// Good: Clear size progression
<h1 className="text-4xl font-bold font-heading">Main Title</h1>
<h2 className="text-3xl font-semibold font-heading">Section</h2>
<h3 className="text-2xl font-medium font-heading">Subsection</h3>
<p className="text-base font-body">Body text</p>

// Bad: Similar sizes, unclear hierarchy
<h1 className="text-2xl">Main Title</h1>
<h2 className="text-xl">Section</h2>
<h3 className="text-lg">Subsection</h3>
```

**Font Weight Progression**
- Display/Hero text: font-bold (700) or font-extrabold (800)
- Headings: font-semibold (600) or font-bold (700)
- Subheadings: font-medium (500)
- Body text: font-normal (400)
- Muted/helper text: font-normal (400) with muted color

**Line Height Best Practices**
```typescript
// Tight line height for headings
<h1 className="text-4xl leading-tight">Heading</h1>  // 1.25

// Normal line height for body text
<p className="text-base leading-normal">Body</p>  // 1.5

// Relaxed for readability in long-form content
<article className="text-base leading-relaxed">Long form...</article>  // 1.75
```

### Color Hierarchy

**Foreground Color Scale**
```tsx
// Primary content (highest contrast)
<h1 className="text-foreground">Main Heading</h1>

// Secondary content (slightly muted)
<p className="text-muted-foreground">Supporting text</p>

// Tertiary content (most muted)
<span className="text-muted-foreground/60">Timestamp</span>

// Accent/CTAs (draws attention)
<Link className="text-primary hover:text-primary/80">Learn more</Link>
```

**Background Layers**
```tsx
// Base layer
<div className="bg-background">Page content</div>

// Elevated layer (cards, modals)
<div className="bg-card">Card content</div>

// Subtle distinction (sections, asides)
<div className="bg-muted">Aside content</div>
```

### Spacing and Layout Rhythm

**Vertical Rhythm** (Consistent spacing between elements)
```tsx
<section className="space-y-8">  {/* 32px between children */}
  <div className="space-y-4">    {/* 16px within section */}
    <h2>Title</h2>
    <p>Description</p>
  </div>
  <div className="space-y-2">    {/* 8px for tight groups */}
    <label>Label</label>
    <input />
  </div>
</section>
```

**Container Spacing**
```tsx
// Page-level spacing
<main className="container mx-auto px-4 py-12 md:py-16 lg:py-20">

// Section spacing
<section className="py-16 md:py-24">

// Component internal spacing
<Card className="p-6">
```

---

## Micro-Interactions and Transitions

### Hover States (Subtle feedback)

```tsx
// Scale on hover (modern, playful)
<Button className="hover:scale-105 transition-transform">
  Click Me
</Button>

// Shadow elevation
<Card className="hover:shadow-lg transition-shadow">
  Content
</Card>

// Color shift
<Link className="text-primary hover:text-primary/80 transition-colors">
  Learn more
</Link>

// Combined effects
<Button className="hover:scale-105 hover:shadow-glow transition-all duration-300">
  Hero CTA
</Button>
```

### Focus States (Accessibility + visual polish)

```tsx
// Modern focus-visible approach (only show on keyboard navigation)
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Keyboard Accessible
</Button>

// Animated focus ring
<Input className="focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all" />
```

### Loading States

```tsx
// Skeleton loaders (better than spinners for content)
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-muted rounded w-3/4"></div>
  <div className="h-4 bg-muted rounded w-1/2"></div>
</div>

// Button loading state
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>

// Shimmer effect (2026 trend)
<div className="bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer">
  Loading content...
</div>
```

### Transition Timing

```typescript
// Prefer ease-out for entrances (starts fast, slows down)
transition: { duration: 0.3, ease: 'easeOut' }

// Prefer ease-in for exits (starts slow, speeds up)
transition: { duration: 0.2, ease: 'easeIn' }

// ease-in-out for state changes
transition: { duration: 0.3, ease: 'easeInOut' }

// Custom cubic-bezier for sophisticated feel
transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }  // Material Design
```

---

## 2026 Modern UI Trends

### 1. Glassmorphism (Frosted glass effect)

```tsx
// Glassmorphic card
<Card className="
  bg-card/80           {/* Semi-transparent background */}
  backdrop-blur-md     {/* Blur background content */}
  border border-border/50
  shadow-lg
">
  <CardContent>Glass effect content</CardContent>
</Card>

// Glass navigation
<nav className="
  fixed top-0 left-0 right-0
  bg-background/70
  backdrop-blur-lg
  border-b border-border/40
  z-50
">
  Navigation items
</nav>
```

**Best Practices**:
- Use sparingly for key UI elements (navbars, modals, cards)
- Ensure text remains readable (sufficient contrast)
- Combine with subtle shadows for depth
- Works best over dynamic/colorful backgrounds

### 2. Bento Grid Layouts (Asymmetric, magazine-style)

```tsx
<div className="grid grid-cols-3 gap-4">
  {/* Spanning multiple columns/rows */}
  <Card className="col-span-2 row-span-2">Large feature</Card>
  <Card className="col-span-1">Small item</Card>
  <Card className="col-span-1">Small item</Card>
  <Card className="col-span-3">Wide item</Card>
  <Card className="col-span-1 row-span-2">Tall item</Card>
  <Card className="col-span-2">Medium item</Card>
</div>
```

**Characteristics**:
- Mix of different-sized cards
- Asymmetric but balanced layout
- Visual interest without overwhelming
- Mobile: Stack or 2-column grid

### 3. Scroll-Driven Animations (CSS Scroll Timeline)

```tsx
// Using Framer Motion with scroll trigger
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6 }}
>
  Content fades in on scroll
</motion.div>

// Parallax effect
<motion.div
  style={{ y: useTransform(scrollY, [0, 1000], [0, -200]) }}
>
  Parallax layer
</motion.div>
```

### 4. Micro-Animations on Interaction

```tsx
// Success animation
<motion.button
  whileTap={{ scale: 0.95 }}
  animate={isSuccess ? {
    scale: [1, 1.1, 1],
    backgroundColor: ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--primary))'],
  } : {}}
>
  {isSuccess ? <Check className="mr-2" /> : null}
  Submit
</motion.button>

// Notification entrance
<motion.div
  initial={{ opacity: 0, x: 100 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 100 }}
  transition={{ type: 'spring', damping: 20 }}
>
  Toast notification
</motion.div>
```

### 5. Gradient Meshes and Complex Gradients

```tsx
// Modern multi-stop gradient
<div className="bg-gradient-to-br from-primary via-accent to-secondary">
  Gradient background
</div>

// Animated gradient (CSS)
<div className="
  bg-gradient-to-r from-primary to-accent
  bg-[length:200%_100%]
  animate-gradient
">
  Animated gradient
</div>

// CSS for animation
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### 6. Command Palettes (Cmd+K pattern)

```tsx
// Using shadcn Command component
<Command>
  <CommandInput placeholder="Search anything..." />
  <CommandList>
    <CommandGroup heading="Suggestions">
      <CommandItem>
        <Calendar className="mr-2 h-4 w-4" />
        Calendar
      </CommandItem>
      <CommandItem>
        <Users className="mr-2 h-4 w-4" />
        Users
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>

// Keyboard shortcut to open
useEffect(() => {
  const down = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(true);
    }
  };
  document.addEventListener('keydown', down);
  return () => document.removeEventListener('keydown', down);
}, []);
```

### 7. Container Queries (Component-level responsiveness)

```css
/* Component adapts to container width, not viewport */
@container (min-width: 400px) {
  .card-title {
    font-size: 1.5rem;
  }
}

@container (min-width: 600px) {
  .card-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}
```

```tsx
// Tailwind with container queries plugin
<div className="@container">
  <div className="@sm:flex @md:grid @md:grid-cols-2">
    Content adapts to parent container
  </div>
</div>
```

### 8. Dark Mode First Design

```tsx
// Define colors that work in both light and dark
:root {
  --background: 0 0% 100%;  /* Light mode: white */
  --foreground: 222 47% 11%;  /* Light mode: dark text */
}

.dark {
  --background: 222 47% 11%;  /* Dark mode: dark bg */
  --foreground: 0 0% 98%;  /* Dark mode: light text */
}

// Component works in both modes
<Card className="bg-background text-foreground">
  Adapts to theme automatically
</Card>
```

**2026 Dark Mode Best Practices**:
- Pure black (#000) causes eye strain - use dark gray (hsl(222 47% 11%))
- Reduce contrast slightly in dark mode (softer whites)
- Adjust shadows (use lighter shadows in dark mode)
- Test both modes equally

---

## Component Design Patterns

### Card Components (Information containers)

```tsx
// Feature card with hover effect
<Card className="
  group
  hover:shadow-xl hover:scale-105
  transition-all duration-300
  cursor-pointer
">
  <CardHeader>
    <CardTitle className="group-hover:text-primary transition-colors">
      Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Description</p>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">Learn more →</Button>
  </CardFooter>
</Card>
```

### Modal/Dialog Patterns

```tsx
// Modern modal with backdrop blur
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>
        Descriptive text about the modal's purpose
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      {/* Modal content */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={close}>Cancel</Button>
      <Button onClick={handleSubmit}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Navigation Patterns (2026)

```tsx
// Sticky nav with blur effect
<nav className="
  sticky top-0
  bg-background/70
  backdrop-blur-lg
  border-b border-border/40
  z-50
">
  <div className="container mx-auto px-4 h-16 flex items-center justify-between">
    <Logo />
    <ul className="flex gap-6">
      <li><Link className="hover:text-primary transition-colors">Home</Link></li>
      <li><Link className="hover:text-primary transition-colors">About</Link></li>
    </ul>
  </div>
</nav>
```

### Form Patterns (Modern validation)

```tsx
// Inline validation with smooth feedback
<Form>
  <FormField
    control={form.control}
    name="email"
    render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input
            {...field}
            className={fieldState.error ? 'border-destructive' : ''}
          />
        </FormControl>
        <FormMessage />  {/* Shows error with slide-in animation */}
      </FormItem>
    )}
  />
</Form>
```

---

## Anti-Patterns to Avoid

### 1. Overuse of Animations
- Animating too many elements simultaneously
- Animations that are too slow (>500ms)
- Animations on every hover (overwhelming)
- Not respecting prefers-reduced-motion

### 2. Inconsistent Spacing
```tsx
// Bad: Random spacing values
<div className="mb-7">
  <div className="mt-13 ml-5">
```

```tsx
// Good: Spacing scale
<div className="mb-8">
  <div className="mt-12 ml-4">
```

### 3. Poor Visual Hierarchy
```tsx
// Bad: Similar sizes, no hierarchy
<h1 className="text-xl">Main Title</h1>
<h2 className="text-lg">Subtitle</h2>
<p className="text-base">Body</p>

// Good: Clear progression
<h1 className="text-4xl font-bold">Main Title</h1>
<h2 className="text-2xl font-semibold">Subtitle</h2>
<p className="text-base">Body</p>
```

### 4. Accessibility Sacrificed for Aesthetics
- Low contrast "clean" design (fails WCAG)
- Icon-only buttons without labels
- Custom components without keyboard support
- Animations that trigger motion sickness

### 5. Hardcoded Values Instead of Tokens
```tsx
// Bad
<Button className="bg-[#0066ff] text-[#ffffff]">Click</Button>

// Good
<Button className="bg-primary text-primary-foreground">Click</Button>
```

---

## Quick Evaluation Checklist

When reviewing a component, check for:

- [ ] **Design Tokens**: Uses semantic tokens (bg-primary) not hardcoded values (#0066ff)
- [ ] **Consistent Variants**: Matches existing component library patterns
- [ ] **Visual Hierarchy**: Clear size/weight/color progression
- [ ] **Spacing**: Uses standardized spacing scale (gap-4, gap-6, not gap-[13px])
- [ ] **Hover States**: Provides visual feedback on interaction
- [ ] **Focus States**: Keyboard users can see focus clearly
- [ ] **Transitions**: Smooth, appropriate duration (200-400ms)
- [ ] **2026 Patterns**: Considers modern trends (glassmorphism, container queries)
- [ ] **Responsive**: Adapts to different screen sizes
- [ ] **Dark Mode**: Works in both light and dark themes
- [ ] **Accessibility**: Maintains usability while being visually appealing

---

Use this skill to evaluate modern design quality, suggest contemporary improvements, and ensure components follow 2026 best practices while maintaining consistency with the project's design system.

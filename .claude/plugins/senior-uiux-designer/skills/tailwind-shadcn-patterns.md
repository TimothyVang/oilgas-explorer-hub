# Tailwind and shadcn/ui Patterns Skill

This skill should be used when analyzing components against the BAH Energy website design system. Apply when validating design token usage, checking component variant consistency, and ensuring adherence to project-specific Tailwind and shadcn/ui patterns.

## BAH Energy Design System

### Color Palette (HSL-based with CSS Variables)

```typescript
// From tailwind.config.ts
colors: {
  primary: 'hsl(var(--primary))',           // Brand blue
  secondary: 'hsl(var(--secondary))',       // Secondary accent
  accent: 'hsl(var(--accent))',             // Cyan/aqua accent
  midnight: {
    DEFAULT: 'hsl(222 47% 11%)',            // Dark navy
    light: 'hsl(217 33% 17%)',              // Lighter navy
  },
  muted: 'hsl(var(--muted))',               // Subtle backgrounds
  foreground: 'hsl(var(--foreground))',     // Primary text
  background: 'hsl(var(--background))',     // Page background
  card: 'hsl(var(--card))',                 // Card backgrounds
  border: 'hsl(var(--border))',             // Borders
}
```

**Usage**:
```tsx
// Good: Using design tokens
<Card className="bg-card border-border text-card-foreground">

// Bad: Hardcoded colors
<Card className="bg-white border-gray-200 text-gray-900">
```

### Typography System

**Font Families**:
```typescript
fontFamily: {
  heading: ['Montserrat', 'sans-serif'],  // Headings, hero text
  body: ['Open Sans', 'sans-serif'],      // Body text, UI
}
```

**Typography Patterns**:
```tsx
// Headings (Montserrat)
<h1 className="font-heading text-4xl font-bold">Main Title</h1>
<h2 className="font-heading text-3xl font-semibold">Section</h2>
<h3 className="font-heading text-2xl font-medium">Subsection</h3>

// Body (Open Sans)
<p className="font-body text-base">Body text content</p>
<span className="font-body text-sm text-muted-foreground">Helper text</span>
```

### Custom Animations

```typescript
// Custom keyframes in tailwind.config.ts
keyframes: {
  "fade-in": {
    "0%": { opacity: "0", transform: "translateY(20px)" },
    "100%": { opacity: "1", transform: "translateY(0)" }
  },
  "fade-in-up": {
    "0%": { opacity: "0", transform: "translateY(40px)" },
    "100%": { opacity: "1", transform: "translateY(0)" }
  },
  "scale-in": {
    "0%": { opacity: "0", transform: "scale(0.95)" },
    "100%": { opacity: "1", transform: "scale(1)" }
  },
  "pulse-glow": {
    "0%, 100%": { opacity: "1", transform: "scale(1)" },
    "50%": { opacity: "0.7", transform: "scale(1.05)" }
  },
}

animation: {
  "fade-in": "fade-in 0.6s ease-out",
  "fade-in-up": "fade-in-up 0.8s ease-out",
  "scale-in": "scale-in 0.5s ease-out",
  "pulse-glow": "pulse-glow 2s ease-in-out infinite",
}
```

**Usage**:
```tsx
// Entry animations
<section className="animate-fade-in">Content fades in</section>
<Card className="animate-scale-in">Card scales in</Card>

// Continuous animations
<div className="animate-pulse-glow">Pulsing element</div>
```

---

## shadcn/ui Component Patterns

### Button Variants

```tsx
// From components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-card",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-accent to-[hsl(var(--energy-blue))] text-white font-semibold hover:shadow-glow hover:scale-105",
        glass: "bg-card/80 backdrop-blur-sm border border-border text-foreground hover:bg-card/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
  }
);
```

**Best Practices**:
- Use `hero` variant for primary CTAs on landing pages
- Use `glass` variant for overlays and modern aesthetics
- Use `outline` for secondary actions
- Maintain variant consistency across similar actions

### Form Patterns (react-hook-form + zod)

```tsx
// Standard form pattern
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Form>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

### Dialog/Modal Patterns

```tsx
// Standard dialog usage
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Component Organization Patterns

### Feature-Based Structure

```
src/components/
├── ui/                    # shadcn/ui base components (52 files)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── admin/                 # Admin-specific components
│   ├── ActivityLogTable.tsx
│   ├── UserDetailModal.tsx
│   └── ...
├── dashboard/             # Dashboard features
│   └── ...
├── about/                 # About page sections
│   └── ...
├── Hero.tsx               # Shared components
├── Navigation.tsx
└── ...
```

### Common Patterns in BAH Energy Codebase

**1. Holographic/Glass Effects**
```tsx
<Card className="
  bg-card/80            {/* Semi-transparent */}
  backdrop-blur-md      {/* Frosted glass */}
  border-border/50
  shadow-lg
">
  Glass effect content
</Card>
```

**2. Hero Buttons with Gradients**
```tsx
<Button variant="hero" size="lg" className="shadow-glow">
  Get Started
</Button>
```

**3. Admin Tables with Actions**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map(user => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            {/* Action buttons */}
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Quick Validation Checklist

- [ ] Uses design tokens (`bg-primary` not `bg-blue-600`)
- [ ] Typography uses correct font families (`font-heading` for headings)
- [ ] Buttons use standard variants (default, outline, hero, glass)
- [ ] Custom animations use project keyframes (fade-in, scale-in, pulse-glow)
- [ ] Forms use react-hook-form + zod pattern
- [ ] Dialogs follow shadcn Dialog pattern
- [ ] Component organization matches feature-based structure
- [ ] Glass effects use `backdrop-blur` with semi-transparent backgrounds
- [ ] Consistent spacing with Tailwind scale (gap-4, gap-6, gap-8)

Use this skill to ensure components match the BAH Energy design system and follow established shadcn/ui patterns.

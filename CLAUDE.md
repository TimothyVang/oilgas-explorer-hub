# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern React + TypeScript web application for oil and gas exploration built with Vite, shadcn-ui, and Tailwind CSS. The application features authentication, role-based access control, investor document management, and an admin dashboard. Originally created with Lovable.dev and enhanced with custom Claude Code plugins.

## Common Commands

### Development
```bash
# Install dependencies
npm i

# Start development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 with SWC
- **Styling**: Tailwind CSS 3 with tailwindcss-animate
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Backend**: Supabase (authentication, database)
- **State Management**: React Context + TanStack React Query
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form with Zod validation
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

## Architecture Overview

### Application Structure

The application follows a feature-based organization pattern:

**Core Application** (`src/`):
- `App.tsx` - Root component with providers (Auth, Query, Routing)
- `main.tsx` - Entry point
- `index.css` - Global styles and Tailwind directives

**Pages** (`src/pages/`):
- `Index.tsx` - Public landing page with hero, services, portfolio
- `Login.tsx` - Authentication page
- `Dashboard.tsx` - User dashboard with profile and documents
- `AdminDashboard.tsx` - Admin panel for user and document management
- `Profile.tsx` - User profile management
- `InvestorDocuments.tsx` - Document access for investors
- `AboutPage.tsx` - Company information with interactive timeline
- `ForgotPassword.tsx` / `ResetPassword.tsx` - Password recovery flow

**Components** (`src/components/`):
- **Layout**: `Navigation.tsx`, `Footer.tsx`, `Hero.tsx`
- **Feature**: `Services.tsx`, `Portfolio.tsx`, `Team.tsx`, `Stats.tsx`, `WhyChooseUs.tsx`, `HowWeWork.tsx`, `Contact.tsx`
- **Admin**: `admin/` - User management, document management, activity logs
- **Dashboard**: `dashboard/` - User-facing document access
- **UI**: `ui/` - shadcn-ui components (40+ reusable primitives)
- **Specialized**: `HolographicCard.tsx`, `InteractiveTimeline.tsx`, `ErrorBoundary.tsx`, `ProtectedRoute.tsx`

**Contexts** (`src/contexts/`):
- `AuthContext.tsx` - Authentication state and methods (user, session, signIn, signUp, signOut)

**Integration** (`src/integrations/supabase/`):
- `client.ts` - Supabase client initialization
- `types.ts` - Database type definitions (auto-generated from Supabase schema)

**Utilities** (`src/lib/`):
- `utils.ts` - cn() utility for Tailwind class merging
- `logActivity.ts` - User activity logging to Supabase

### Authentication & Authorization

**Authentication Flow**:
1. User signs up/signs in via `AuthContext` using Supabase Auth
2. Session stored and managed by Supabase client
3. `onAuthStateChange` listener keeps UI in sync
4. Email verification required for new accounts

**Protected Routes**:
- `/dashboard`, `/profile`, `/investor-documents` - Require authentication
- `/admin` - Requires authentication + admin role

**ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`):
```tsx
<ProtectedRoute>           // Auth required
  <Dashboard />
</ProtectedRoute>

<ProtectedRoute requireAdmin>  // Auth + admin role required
  <AdminDashboard />
</ProtectedRoute>
```

**Auth Methods** (available via `useAuth()` hook):
- `signUp(email, password, fullName)` - Register new user
- `signIn(email, password)` - Login existing user
- `signOut()` - Logout current user
- `user` - Current user object (null if not authenticated)
- `session` - Current session (null if not authenticated)
- `loading` - Auth initialization state

### State Management

**React Context**:
- `AuthContext` - Global authentication state

**TanStack React Query**:
- Used for server state management (Supabase queries)
- Configured with `QueryClient` at app root
- Handles caching, refetching, optimistic updates

**Local Component State**:
- `useState` for UI state
- `useForm` (React Hook Form) for form state

### Styling System

**Tailwind CSS Configuration**:
- Custom color palette defined in `tailwind.config.js`
- Design tokens for spacing, typography, shadows
- Dark mode support via CSS variables
- Custom animations defined in config

**Component Styling Pattern**:
```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className  // Allow override from props
)}>
```

**shadcn-ui Components**:
- Located in `src/components/ui/`
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Customizable via `components.json`

### Data Layer

**Supabase Integration**:
- Client initialized in `src/integrations/supabase/client.ts`
- Type-safe queries using generated types (`types.ts`)
- Real-time subscriptions available
- Row Level Security (RLS) enforced at database level

**Common Patterns**:
```tsx
import { supabase } from "@/integrations/supabase/client"

// Query data
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .eq('user_id', userId)

// Insert data
const { error } = await supabase
  .from('activity_log')
  .insert({ action: 'login', user_id: userId })

// Real-time subscription
const subscription = supabase
  .channel('documents')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' },
    (payload) => console.log(payload)
  )
  .subscribe()
```

## Claude Code Plugin Integration

This project includes a custom **Senior UI/UX Designer** plugin located in `.claude/plugins/senior-uiux-designer/`.

### Available Plugin Commands

**Design Review**:
```bash
/review-design                    # Review recent changes
/review-design src/components/Hero.tsx
/review-design --focus accessibility
```

**Accessibility Audit**:
```bash
/accessibility-audit              # Audit current file
/accessibility-audit http://localhost:8080 --browser true
/accessibility-audit --level AAA
```

**Responsive Check**:
```bash
/responsive-check                 # Check responsive design
/responsive-check http://localhost:8080
/responsive-check --viewports "375,768,1920"
```

### Proactive Agents

The plugin includes two autonomous agents that provide real-time feedback:

**Accessibility Watcher**:
- Triggers when creating/modifying forms, buttons, modals, navigation
- Checks for missing labels, ARIA attributes, keyboard navigation
- Validates WCAG 2.2 compliance (Level A/AA)

**Design Guardian**:
- Triggers when creating/modifying UI components
- Detects hardcoded colors, suggests design tokens
- Validates component patterns and visual hierarchy
- Suggests modern UI enhancements

## Development Patterns

### Adding a New Page

1. Create page component in `src/pages/NewPage.tsx`
2. Add route to `App.tsx`:
```tsx
<Route path="/new-page" element={<NewPage />} />
// OR for protected route:
<Route path="/new-page" element={
  <ProtectedRoute>
    <NewPage />
  </ProtectedRoute>
} />
```
3. Update navigation in `Navigation.tsx` if needed

### Adding a shadcn-ui Component

```bash
# Use npx to add components
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select

# Components are added to src/components/ui/
# Configuration in components.json
```

### Creating Reusable Components

Follow the established pattern:
```tsx
import { cn } from "@/lib/utils"

interface ComponentProps {
  className?: string
  // ... other props
}

export const Component = ({ className, ...props }: ComponentProps) => {
  return (
    <div className={cn("default-classes", className)}>
      {/* component content */}
    </div>
  )
}
```

### Form Handling Pattern

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Handle submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* form fields */}
      </form>
    </Form>
  )
}
```

### Supabase Query Pattern with React Query

```tsx
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

const useDocuments = (userId: string) => {
  return useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      return data
    }
  })
}
```

## Project Configuration Files

### Vite Configuration (`vite.config.ts`)

- **Server**: Runs on port 8080, host `::`
- **Plugins**: React SWC, Lovable component tagger (dev only)
- **Path Alias**: `@` → `./src`

### TypeScript Configuration

- `tsconfig.json` - Base configuration
- `tsconfig.app.json` - App-specific settings with path aliases
- `tsconfig.node.json` - Node environment settings

### Tailwind Configuration (`tailwind.config.ts`)

- Custom color palette with CSS variables
- Dark mode support
- Animation keyframes
- Typography plugin
- Path aliases for content scanning

### ESLint Configuration (`eslint.config.js`)

- TypeScript-aware linting
- React Hooks rules
- React Refresh plugin

### shadcn-ui Configuration (`components.json`)

- Style: Default
- TypeScript: Enabled
- Tailwind: CSS variables
- Path aliases: `@/components`, `@/lib`, `@/hooks`

## Important Implementation Notes

### Route Organization in App.tsx

Routes are organized in a specific order:
1. Public routes first (`/`, `/login`, `/about`, etc.)
2. Protected routes (require authentication)
3. Admin routes (require admin role)
4. **Catch-all `*` route MUST be last** (NotFound page)

When adding new routes, insert them **before** the `*` catch-all route.

### Authentication State Management

The `AuthContext` sets up the auth listener BEFORE checking for existing session to avoid race conditions:
```tsx
// 1. Set up listener FIRST
supabase.auth.onAuthStateChange((event, session) => { ... })

// 2. THEN check existing session
supabase.auth.getSession().then(({ data: { session } }) => { ... })
```

### Protected Route Access Control

The `ProtectedRoute` component:
- Shows loading spinner while auth initializes
- Redirects to `/login` if not authenticated
- Checks `requireAdmin` prop for admin-only routes
- Uses `useAuth()` hook for current auth state

### Path Aliases

Use `@` prefix for imports to avoid relative path complexity:
```tsx
// Good
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { cn } from "@/lib/utils"

// Avoid
import { Button } from "../../../components/ui/button"
```

### Styling Best Practices

- Use Tailwind utility classes for styling
- Use `cn()` utility for conditional classes
- Define colors as CSS variables in `:root` (supports dark mode)
- Prefer shadcn-ui components over custom implementations
- Follow mobile-first responsive patterns

### Accessibility Requirements

This project has a Senior UI/UX Designer plugin that enforces:
- WCAG 2.2 Level AA compliance (minimum)
- Form labels for all inputs
- ARIA attributes on interactive elements
- Keyboard navigation support
- Color contrast ratios (4.5:1 for text)
- Touch target sizes (44x44px minimum)

The plugin's agents will provide real-time feedback during development.

## Common Pitfalls

1. **Adding routes after catch-all**: New routes won't match if placed after `<Route path="*">`
2. **Missing form labels**: Accessibility Watcher will flag this immediately
3. **Hardcoded colors**: Design Guardian suggests using design tokens instead
4. **Forgetting ProtectedRoute**: Private pages need explicit protection
5. **Not handling loading states**: Auth context has `loading` flag, use it
6. **Supabase RLS**: Database access controlled by Row Level Security policies (not client-side)

## Deployment

This project is configured for Lovable.dev deployment:

1. **Via Lovable**: Visit project URL and click Share → Publish
2. **Via Git**: Push to connected Git repository
3. **Custom Domain**: Configure in Project > Settings > Domains

Environment variables should be configured in Lovable project settings (Supabase URL, Anon Key, etc.).

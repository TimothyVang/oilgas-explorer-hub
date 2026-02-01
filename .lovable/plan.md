

## Dashboard Loading Issue - Analysis & Fix Plan

### Problem Identified
The Investor Dashboard shows **skeleton loaders indefinitely** for the "Recent Activity" and "Tasks" sections while the stat cards show default values. Investigation revealed:

1. **No Supabase API calls are being made** - The `useInvestorDashboard` hook is not fetching data
2. **The stats show default values** (Pending, 0, 0, Investor) - not actual loaded data
3. **The `loading` state is stuck at `true`** - causing skeleton loaders to show forever

### Root Cause
There's a timing/race condition between the `AuthContext` providing the `user` object and the `useInvestorDashboard` hook's `useEffect` running. When the dashboard renders:

1. `useAuth()` returns `{ user: null, loading: true }` initially
2. `useInvestorDashboard` runs with `user = null`, hits early return at line 42-44, sets `loading = false`
3. When auth finally resolves and `user` becomes available, the `useEffect` runs again
4. But there may be a React strict mode double-render or state update issue causing the loading state to get stuck

### Solution
Fix the `useInvestorDashboard` hook to properly handle the auth loading state and ensure the loading state is correctly managed:

**File: `src/hooks/useInvestorDashboard.ts`**

1. **Add dependency on auth loading state** - Import and use `loading` from `useAuth()` to wait until auth is resolved
2. **Keep loading true while auth is still resolving** - Don't set `loading = false` if we're still waiting for auth
3. **Add proper cleanup for race conditions** - Use an `isMounted` flag to prevent state updates after unmount

```typescript
export const useInvestorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({...});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardData = async () => {
      // Wait for auth to finish loading first
      if (authLoading) {
        return; // Keep loading = true
      }
      
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // ... existing fetch logic ...
        
        if (isMounted) {
          setStats({...});
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    
    return () => {
      isMounted = false;
    };
  }, [user, authLoading]); // Add authLoading to dependencies

  return { stats, loading };
};
```

### Technical Details

**Changes to `src/hooks/useInvestorDashboard.ts`:**

| Line | Change |
|------|--------|
| 29 | Import `loading` as `authLoading` from `useAuth()` |
| 40-45 | Add `isMounted` flag and early return if `authLoading` is true |
| 147-160 | Wrap all `setStats` and `setLoading` calls with `isMounted` check |
| 166 | Add `authLoading` to the dependency array |
| Add | Return cleanup function to set `isMounted = false` |

This ensures:
- The hook waits for authentication to complete before deciding what to do
- Race conditions from component unmounting are prevented
- Loading state is only set to false when we're truly done fetching or when there's no user


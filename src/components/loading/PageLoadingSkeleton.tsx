import { Skeleton } from "@/components/ui/skeleton";

interface PageLoadingSkeletonProps {
  message?: string;
}

/**
 * Full page loading skeleton for initial page loads
 */
export const PageLoadingSkeleton = ({ message }: PageLoadingSkeletonProps = {}) => (
  <div className="min-h-screen bg-midnight flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      {message ? (
        <span className="text-white/60 text-sm">{message}</span>
      ) : (
        <Skeleton className="h-4 w-24 bg-white/10" />
      )}
    </div>
  </div>
);

/**
 * Dashboard loading skeleton with stats, activity, and sidebar
 */
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-midnight text-white">
    <div className="flex h-screen p-6 gap-6">
      {/* Sidebar skeleton */}
      <aside className="w-20 hidden md:flex flex-col items-center py-8 border-r border-white/10">
        <Skeleton className="w-12 h-12 rounded-xl bg-white/10 mb-10" />
        <div className="flex-1 flex flex-col gap-2 w-full px-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-11 rounded-xl bg-white/10" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <Skeleton className="h-10 w-48 bg-white/10 mb-2" />
            <Skeleton className="h-4 w-32 bg-white/10" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <Skeleton className="h-4 w-24 bg-white/10 mb-1" />
              <Skeleton className="h-3 w-16 bg-white/10" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
          </div>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-b border-white/10 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-10 w-20 mx-auto bg-white/10 mb-2" />
              <Skeleton className="h-4 w-24 mx-auto bg-white/10" />
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity column */}
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-32 bg-white/10" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/10" />
              ))}
            </div>
          </div>

          {/* Tasks column */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-20 bg-white/10" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Admin dashboard loading skeleton with table
 */
export const AdminDashboardSkeleton = () => (
  <div className="min-h-screen bg-midnight relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,20,40,1)_0%,rgba(2,4,16,1)_100%)]" />

    <div className="relative z-10 container mx-auto px-4 py-8 pt-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-5 w-36 bg-white/10" />
        <Skeleton className="h-10 w-24 bg-white/10 rounded-md" />
      </div>

      {/* Admin Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-6xl mx-auto">
        {/* Card header */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-12 h-12 rounded-xl bg-white/10" />
          <div>
            <Skeleton className="h-7 w-48 bg-white/10 mb-2" />
            <Skeleton className="h-4 w-64 bg-white/10" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-white/10" />
          ))}
        </div>

        {/* Tabs */}
        <Skeleton className="h-10 w-80 bg-white/10 mb-6 rounded-lg" />

        {/* Table */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-full bg-white/10 rounded-lg" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Profile page loading skeleton
 */
export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-midnight relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,20,40,1)_0%,rgba(2,4,16,1)_100%)]" />

    <div className="relative z-10 container mx-auto px-4 py-8 pt-32">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <Skeleton className="w-24 h-24 rounded-full bg-white/10 mb-4" />
          <Skeleton className="h-6 w-32 bg-white/10 mb-2" />
          <Skeleton className="h-4 w-48 bg-white/10" />
        </div>

        {/* Form fields */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 bg-white/10 mb-2" />
              <Skeleton className="h-10 w-full bg-white/10 rounded-md" />
            </div>
          ))}
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-full bg-white/10 rounded-md mt-6" />
      </div>
    </div>
  </div>
);

/**
 * Login page loading skeleton
 */
export const LoginSkeleton = () => (
  <div className="min-h-screen bg-midnight flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <Skeleton className="w-16 h-16 rounded-xl bg-white/10 mx-auto mb-4" />
        <Skeleton className="h-6 w-32 bg-white/10 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 bg-white/10 mx-auto" />
      </div>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="h-4 w-16 bg-white/10 mb-2" />
            <Skeleton className="h-10 w-full bg-white/10 rounded-md" />
          </div>
        ))}
      </div>

      <Skeleton className="h-10 w-full bg-white/10 rounded-md mt-6" />
      <Skeleton className="h-10 w-full bg-white/10 rounded-md mt-3" />
    </div>
  </div>
);

/**
 * Card loading skeleton for document lists
 */
export const CardsSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="border border-white/10 rounded-xl p-6 bg-white/5">
        <Skeleton className="w-10 h-10 rounded-lg bg-white/10 mb-4" />
        <Skeleton className="h-5 w-3/4 bg-white/10 mb-2" />
        <Skeleton className="h-4 w-full bg-white/10 mb-1" />
        <Skeleton className="h-4 w-2/3 bg-white/10" />
      </div>
    ))}
  </div>
);

/**
 * Table loading skeleton
 */
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-white/5 rounded-lg">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-4 bg-white/10" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-5 gap-4 px-4 py-4 border border-white/10 rounded-lg">
        {[1, 2, 3, 4, 5].map((j) => (
          <Skeleton key={j} className="h-4 bg-white/10" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Activity list loading skeleton
 */
export const ActivitySkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border border-white/10 rounded-xl">
        <Skeleton className="w-2 h-2 rounded-full bg-white/10" />
        <div className="flex-1">
          <Skeleton className="h-4 w-48 bg-white/10 mb-1" />
          <Skeleton className="h-3 w-24 bg-white/10" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Stats row loading skeleton for dashboard stat cards
 */
export const StatsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-8 border-t border-b border-white/10 py-8`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="text-center">
        <Skeleton className="h-10 w-20 mx-auto bg-white/10 mb-2" />
        <Skeleton className="h-4 w-16 mx-auto bg-white/10" />
      </div>
    ))}
  </div>
);

/**
 * Document cards loading skeleton for investor documents
 */
export const DocumentCardsSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="w-10 h-10 rounded-lg bg-white/10" />
          <Skeleton className="h-5 w-12 bg-white/10 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4 bg-white/10 mb-2" />
        <Skeleton className="h-4 w-full bg-white/10 mb-1" />
        <Skeleton className="h-4 w-2/3 bg-white/10 flex-1" />
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <Skeleton className="h-3 w-20 bg-white/10" />
          <Skeleton className="h-8 w-16 bg-white/10 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

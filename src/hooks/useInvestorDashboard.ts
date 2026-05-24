import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { demoInvestorDocuments, isDemoInvestorUser } from "@/lib/demoInvestorPortal";

interface DashboardStats {
  totalDocuments: number;
  assignedDocuments: number;
  ndaSigned: boolean;
  ndaSignedAt: string | null;
  recentActivity: ActivityItem[];
  pendingTasks: TaskItem[];
}

interface ActivityItem {
  id: string;
  action: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

interface TaskItem {
  id: string;
  title: string;
  status: "critical" | "pending" | "scheduled" | "done";
  type: "nda" | "document" | "action";
}

export const useInvestorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    assignedDocuments: 0,
    ndaSigned: false,
    ndaSignedAt: null,
    recentActivity: [],
    pendingTasks: [],
  });
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

      if (isDemoInvestorUser(user)) {
        if (isMounted) {
          setStats({
            totalDocuments: demoInvestorDocuments.length,
            assignedDocuments: demoInvestorDocuments.length,
            ndaSigned: true,
            ndaSignedAt: "2026-05-24T00:00:00Z",
            recentActivity: [
              {
                id: "demo-login",
                action: "demo_access_opened",
                created_at: new Date().toISOString(),
                metadata: { mode: "demo" },
              },
              {
                id: "demo-files",
                action: "investor_files_ready",
                created_at: "2026-05-24T00:00:00Z",
                metadata: { count: demoInvestorDocuments.length },
              },
            ],
            pendingTasks: [
              {
                id: "review-files",
                title: "Open Investor Files",
                status: "pending",
                type: "document",
              },
            ],
          });
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch user's profile for NDA status
        const { data: profile } = await supabase
          .from("profiles")
          .select("nda_signed, nda_signed_at")
          .eq("user_id", user.id)
          .maybeSingle();

        // Fetch documents assigned to user
        const { data: assignedDocs, count: assignedCount } = await supabase
          .from("user_document_access")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

        // Fetch total documents available (if NDA signed)
        let totalDocs = 0;
        if (profile?.nda_signed) {
          const { count } = await supabase
            .from("investor_documents")
            .select("id", { count: "exact", head: true });
          totalDocs = count || 0;
        }

        // Fetch recent activity for this user (increased limit for "View All")
        const { data: activities } = await supabase
          .from("activity_logs")
          .select("id, action, created_at, metadata")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        // Keep the dashboard focused on one plain-language next step.
        const tasks: TaskItem[] = [];
        const docsAssigned = assignedCount || 0;

        if (!profile?.nda_signed) {
          tasks.push({
            id: "access-pending",
            title: "Access review in progress",
            status: "critical",
            type: "nda",
          });
        } else if (docsAssigned === 0) {
          tasks.push({
            id: "docs-pending",
            title: "Waiting for assigned files",
            status: "pending",
            type: "document",
          });
        } else {
          const { data: accessLogs } = await supabase
            .from("activity_logs")
            .select("metadata")
            .eq("user_id", user.id)
            .eq("action", "document_access");

          const accessedDocIds = new Set(
            (accessLogs || [])
              .map((log) => (log.metadata as Record<string, unknown>)?.document_id)
              .filter(Boolean)
          );

          const { data: assignedDocDetails } = await supabase
            .from("user_document_access")
            .select("document_id")
            .eq("user_id", user.id);

          const unreadCount = (assignedDocDetails || []).filter(
            (doc) => !accessedDocIds.has(doc.document_id)
          ).length;

          tasks.push({
            id: unreadCount > 0 ? "unread-docs" : "docs-review",
            title: unreadCount > 0
              ? `Open ${unreadCount} new file${unreadCount === 1 ? "" : "s"}`
              : `View ${docsAssigned} assigned file${docsAssigned === 1 ? "" : "s"}`,
            status: unreadCount > 0 ? "pending" : "scheduled",
            type: "document",
          });
        }

        if (isMounted) {
          setStats({
            totalDocuments: totalDocs,
            assignedDocuments: docsAssigned,
            ndaSigned: profile?.nda_signed || false,
            ndaSignedAt: profile?.nda_signed_at || null,
            recentActivity: (activities || []).map((a) => ({
              ...a,
              metadata: a.metadata as Record<string, unknown>,
            })),
            pendingTasks: tasks,
          });
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
  }, [user, authLoading]);

  return { stats, loading };
};

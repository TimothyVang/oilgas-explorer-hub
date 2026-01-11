import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
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
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
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

        // Build dynamic tasks based on real status
        const tasks: TaskItem[] = [];

        // NDA task
        if (!profile?.nda_signed) {
          tasks.push({
            id: "nda",
            title: "Sign Investor NDA",
            status: "critical",
            type: "nda",
          });
        } else {
          tasks.push({
            id: "nda",
            title: "NDA Signed",
            status: "done",
            type: "nda",
          });
        }

        // Document access task
        const docsAssigned = assignedCount || 0;
        if (docsAssigned === 0 && profile?.nda_signed) {
          tasks.push({
            id: "docs-pending",
            title: "Awaiting Document Access",
            status: "pending",
            type: "document",
          });
        } else if (docsAssigned > 0) {
          tasks.push({
            id: "docs-review",
            title: `Review ${docsAssigned} Document${docsAssigned > 1 ? "s" : ""}`,
            status: "scheduled",
            type: "document",
          });
        }

        // Check for unread documents (documents assigned but not accessed)
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

        if (unreadCount > 0) {
          tasks.push({
            id: "unread-docs",
            title: `${unreadCount} New Document${unreadCount > 1 ? "s" : ""} to Review`,
            status: "pending",
            type: "document",
          });
        }

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
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return { stats, loading };
};

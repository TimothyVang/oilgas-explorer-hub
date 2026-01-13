import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Calendar,
  Filter,
  X,
  FileText,
  User,
  Shield,
  LogIn,
  LogOut,
  FileCheck,
  Edit,
  Trash2,
  Users,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActivityAction } from "@/lib/logActivity";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface AuditTrailProps {
  profiles: Array<{
    user_id: string;
    full_name: string | null;
    email?: string | null;
  }>;
}

const ITEMS_PER_PAGE = 15;

// Action categories for filtering
const ACTION_CATEGORIES = {
  all: { label: "All Actions", icon: Filter },
  auth: { label: "Authentication", icon: LogIn, actions: ["sign_in", "sign_out"] },
  profile: { label: "Profile Updates", icon: User, actions: ["profile_update"] },
  documents: { label: "Document Actions", icon: FileText, actions: ["document_access", "admin_document_created", "admin_document_updated", "admin_document_deleted", "admin_bulk_document_assign"] },
  nda: { label: "NDA Actions", icon: FileCheck, actions: ["nda_signed", "nda_sign_initiated", "admin_nda_reset", "admin_bulk_nda_reset", "admin_role_changed", "admin_role_assigned", "admin_role_removed", "admin_user_deleted"] },
  admin: { label: "Admin Actions", icon: Shield, actions: ["admin_nda_reset", "admin_document_created", "admin_document_updated", "admin_document_deleted", "admin_bulk_document_assign", "admin_bulk_nda_reset", "admin_role_changed", "admin_role_assigned", "admin_role_removed", "admin_user_deleted"] },
} as const;

// Human-readable action labels
const ACTION_LABELS: Record<ActivityAction | string, string> = {
  sign_in: "Signed In",
  sign_out: "Signed Out",
  profile_update: "Updated Profile",
  document_access: "Accessed Document",
  nda_signed: "Signed NDA",
  nda_sign_initiated: "Started NDA Signing",
  admin_nda_reset: "Reset NDA (Admin)",
  admin_document_created: "Created Document (Admin)",
  admin_document_updated: "Updated Document (Admin)",
  admin_document_deleted: "Deleted Document (Admin)",
  admin_bulk_document_assign: "Bulk Assigned Documents",
  admin_bulk_nda_reset: "Bulk Reset NDAs",
  admin_role_changed: "Changed User Role",
  admin_role_assigned: "Assigned Role",
  admin_role_removed: "Removed Role",
  admin_user_deleted: "Deleted User",
};

// Icon mapping for actions
const getActionIcon = (action: string) => {
  if (action.includes("sign_in")) return LogIn;
  if (action.includes("sign_out")) return LogOut;
  if (action.includes("document")) return FileText;
  if (action.includes("nda")) return FileCheck;
  if (action.includes("profile")) return Edit;
  if (action.includes("delete")) return Trash2;
  if (action.includes("role")) return Shield;
  if (action.includes("bulk")) return Users;
  if (action.includes("admin")) return Shield;
  return FileText;
};

// Badge variant mapping
const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  if (action.includes("delete")) return "destructive";
  if (action.includes("sign_in")) return "default";
  if (action.includes("sign_out")) return "secondary";
  if (action.includes("admin")) return "outline";
  if (action.includes("nda")) return "default";
  return "secondary";
};

export const AuditTrail = ({ profiles }: AuditTrailProps) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [actionCategory, setActionCategory] = useState<keyof typeof ACTION_CATEGORIES>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userIdFilter, setUserIdFilter] = useState<string>("all");

  const fetchLogs = async () => {
    setLoading(true);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("activity_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply date filters
    if (dateFrom) {
      query = query.gte("created_at", new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      // Add one day to include the end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt("created_at", endDate.toISOString());
    }

    // Apply user filter
    if (userIdFilter !== "all") {
      query = query.eq("user_id", userIdFilter);
    }

    // Apply action category filter
    if (actionCategory !== "all") {
      const category = ACTION_CATEGORIES[actionCategory];
      if ("actions" in category) {
        query = query.in("action", category.actions);
      }
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Error fetching activity logs:", error);
    } else {
      // Enrich logs with user info
      const enrichedLogs = (data || []).map((log) => {
        const profile = profiles.find((p) => p.user_id === log.user_id);
        return {
          ...log,
          metadata: log.metadata as Record<string, unknown>,
          user_name: profile?.full_name || "Unknown User",
          user_email: profile?.email || "—",
        };
      });
      setLogs(enrichedLogs);
      setTotalCount(count || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (profiles.length > 0) {
      fetchLogs();
    }
  }, [profiles, currentPage, actionCategory, dateFrom, dateTo, userIdFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, actionCategory, dateFrom, dateTo, userIdFilter]);

  // Client-side search filtering
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.user_name?.toLowerCase().includes(query) ||
        log.user_email?.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        JSON.stringify(log.metadata).toLowerCase().includes(query)
    );
  }, [logs, searchQuery]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchQuery("");
    setActionCategory("all");
    setDateFrom("");
    setDateTo("");
    setUserIdFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || actionCategory !== "all" || dateFrom || dateTo || userIdFilter !== "all";

  // Export functionality
  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Email", "Action", "Details"];
    const rows = filteredLogs.map((log) => [
      new Date(log.created_at).toISOString(),
      log.user_name || "Unknown",
      log.user_email || "-",
      ACTION_LABELS[log.action] || log.action,
      JSON.stringify(log.metadata),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const formatMetadata = (metadata: Record<string, unknown>): string => {
    if (!metadata || Object.keys(metadata).length === 0) return "—";

    // Format specific metadata fields nicely
    const parts: string[] = [];

    if (metadata.document_name) parts.push(`Doc: ${metadata.document_name}`);
    if (metadata.document_id) parts.push(`ID: ${String(metadata.document_id).slice(0, 8)}...`);
    if (metadata.user_name) parts.push(`User: ${metadata.user_name}`);
    if (metadata.user_count) parts.push(`Users: ${metadata.user_count}`);
    if (metadata.redirect_url) parts.push("DocuSign redirect");
    if (metadata.reason) parts.push(`Reason: ${metadata.reason}`);

    if (parts.length > 0) return parts.join(" | ");

    return JSON.stringify(metadata);
  };

  return (
    <div className="space-y-4">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Audit Trail
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Complete activity history with filtering and export
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={filteredLogs.length === 0}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            placeholder="Search by user, action, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        {/* Action Category Filter */}
        <Select value={actionCategory} onValueChange={(v) => setActionCategory(v as keyof typeof ACTION_CATEGORIES)}>
          <SelectTrigger className="w-full lg:w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ACTION_CATEGORIES).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <value.icon className="w-4 h-4" />
                  {value.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User Filter */}
        <Select value={userIdFilter} onValueChange={setUserIdFilter}>
          <SelectTrigger className="w-full lg:w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                All Users
              </div>
            </SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={profile.user_id} value={profile.user_id}>
                {profile.full_name || profile.email || "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full lg:w-auto border-white/20 text-white hover:bg-white/10"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {dateFrom || dateTo ? (
                <span>
                  {dateFrom || "Start"} - {dateTo || "End"}
                </span>
              ) : (
                "Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Filter by Date</h4>
              <div className="grid gap-2">
                <div>
                  <label className="text-sm text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // Set to last 7 days
                    const today = new Date();
                    const lastWeek = new Date(today);
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    setDateFrom(lastWeek.toISOString().split("T")[0]);
                    setDateTo(today.toISOString().split("T")[0]);
                  }}
                >
                  Last 7 Days
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // Set to last 30 days
                    const today = new Date();
                    const lastMonth = new Date(today);
                    lastMonth.setDate(lastMonth.getDate() - 30);
                    setDateFrom(lastMonth.toISOString().split("T")[0]);
                    setDateTo(today.toISOString().split("T")[0]);
                  }}
                >
                  Last 30 Days
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-white/60">
        Showing {filteredLogs.length} of {totalCount} activities
        {hasActiveFilters && " (filtered)"}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-gray-300 w-48">Timestamp</TableHead>
              <TableHead className="text-gray-300">User</TableHead>
              <TableHead className="text-gray-300">Action</TableHead>
              <TableHead className="text-gray-300">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-white/60">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading audit trail...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="text-white/60">
                    {hasActiveFilters
                      ? "No activities match your filters"
                      : "No activity logs found"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-gray-400 text-sm">
                      <div>
                        <p>{new Date(log.created_at).toLocaleDateString()}</p>
                        <p className="text-white/40">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-white text-sm font-medium">
                          {log.user_name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {log.user_name}
                          </p>
                          <p className="text-xs text-white/40">
                            {log.user_email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getActionBadgeVariant(log.action)}
                        className="gap-1"
                      >
                        <ActionIcon className="w-3 h-3" />
                        {ACTION_LABELS[log.action] || log.action.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-white/60 max-w-xs">
                      <span className="block truncate" title={JSON.stringify(log.metadata)}>
                        {formatMetadata(log.metadata)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            Page {currentPage} of {totalPages} ({totalCount} total activities)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

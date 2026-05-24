import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import type { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowLeft, Shield, Users, RefreshCw, ChevronLeft, ChevronRight, FileText, Activity, CheckCircle, Eye, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserFilters } from "@/components/admin/UserFilters";
import { logActivity } from "@/lib/logActivity";
import { ActivityLogTable } from "@/components/admin/ActivityLogTable";
import { DocumentsManager } from "@/components/admin/DocumentsManager";
import { AuditTrail } from "@/components/admin/AuditTrail";
import { UserActionsDropdown } from "@/components/admin/UserActionsDropdown";
import { UserDetailModal } from "@/components/admin/UserDetailModal";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminDashboardSkeleton, TableSkeleton } from "@/components/loading/PageLoadingSkeleton";


interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  email?: string;
  avatar_url: string | null;
  nda_signed: boolean;
  nda_signed_at: string | null;
}

interface UserRole {
  user_id: string;
  role: "admin" | "moderator" | "user";
}

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  
  const [activityUserFilter, setActivityUserFilter] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [ndaFilter, setNdaFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const handleViewUserDetail = (profile: UserProfile) => {
    setSelectedUser(profile);
    setDetailModalOpen(true);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAdmin, adminLoading, user, navigate]);

  const fetchData = useCallback(async () => {
    setLoadingData(true);

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles.",
        variant: "destructive",
      });
    } else {
      setProfiles(profilesData || []);
    }

    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    } else {
      setUserRoles(rolesData || []);
    }

    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (isAdmin && user) {
      fetchData();
    }
  }, [isAdmin, user, fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, ndaFilter, dateRangeFilter, statusFilter]);

  useEffect(() => {
    setSelectedUserIds(new Set());
  }, [searchQuery, roleFilter, ndaFilter, dateRangeFilter, statusFilter]);

  const selectedUsers = profiles.filter((p) => selectedUserIds.has(p.user_id));

  const toggleSelectUser = (userId: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUserIds(newSet);
  };

  const getUserRole = useCallback((userId: string): "admin" | "moderator" | "user" | null => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role || null;
  }, [userRoles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" ||
        (profile.full_name?.toLowerCase().includes(searchLower)) ||
        (profile.email?.toLowerCase().includes(searchLower)) ||
        (profile.company_name?.toLowerCase().includes(searchLower));

      const role = getUserRole(profile.user_id);
      const matchesRole = roleFilter === "all" ||
        (roleFilter === "none" && !role) ||
        role === roleFilter;

      const matchesNda = ndaFilter === "all" ||
        (ndaFilter === "signed" && profile.nda_signed) ||
        (ndaFilter === "pending" && !profile.nda_signed);

      // Date range filtering
      const createdDate = new Date(profile.created_at);
      const matchesDateRange =
        !dateRangeFilter?.from && !dateRangeFilter?.to ? true :
        (dateRangeFilter?.from && dateRangeFilter?.to)
          ? createdDate >= dateRangeFilter.from && createdDate <= dateRangeFilter.to
          : dateRangeFilter?.from
            ? createdDate >= dateRangeFilter.from
            : dateRangeFilter?.to
              ? createdDate <= dateRangeFilter.to
              : true;

      // Status filtering (based on account age/activity)
      const now = new Date();
      const daysSinceCreated = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "new" && daysSinceCreated <= 7) ||
        (statusFilter === "active" && daysSinceCreated > 7 && daysSinceCreated <= 30) ||
        (statusFilter === "inactive" && daysSinceCreated > 30);

      return matchesSearch && matchesRole && matchesNda && matchesDateRange && matchesStatus;
    });
  }, [profiles, searchQuery, roleFilter, ndaFilter, dateRangeFilter, statusFilter, getUserRole]);

  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProfiles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProfiles, currentPage]);

  const isAllSelected = paginatedProfiles.length > 0 && 
    paginatedProfiles.every((p) => selectedUserIds.has(p.user_id));
  
  const toggleSelectAll = () => {
    if (isAllSelected) {
      const newSet = new Set(selectedUserIds);
      paginatedProfiles.forEach((p) => newSet.delete(p.user_id));
      setSelectedUserIds(newSet);
    } else {
      const newSet = new Set(selectedUserIds);
      paginatedProfiles.forEach((p) => newSet.add(p.user_id));
      setSelectedUserIds(newSet);
    }
  };

  const ndaSignedCount = profiles.filter(p => p.nda_signed).length;

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === user?.id) {
      toast({
        title: "Action Not Allowed",
        description: "You cannot change your own role.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingRole(userId);
    const currentRole = getUserRole(userId);

    if (newRole === "none") {
      if (currentRole) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to remove role.",
            variant: "destructive",
          });
        } else {
          const targetUser = profiles.find(p => p.user_id === userId);
          await logActivity("admin_role_removed", {
            target_user_id: userId,
            target_user_name: targetUser?.full_name || "Unknown",
            previous_role: currentRole,
          });
          toast({
            title: "Role Removed",
            description: "User role has been removed.",
          });
          fetchData();
        }
      }
    } else {
      if (currentRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole as "admin" | "moderator" | "user" })
          .eq("user_id", userId);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update role.",
            variant: "destructive",
          });
        } else {
          const targetUser = profiles.find(p => p.user_id === userId);
          await logActivity("admin_role_changed", {
            target_user_id: userId,
            target_user_name: targetUser?.full_name || "Unknown",
            previous_role: currentRole,
            new_role: newRole,
          });
          toast({
            title: "Role Updated",
            description: `User role has been updated to ${newRole}.`,
          });
          fetchData();
        }
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole as "admin" | "moderator" | "user" });

        if (error) {
          toast({
            title: "Error",
            description: "Failed to assign role.",
            variant: "destructive",
          });
        } else {
          const targetUser = profiles.find(p => p.user_id === userId);
          await logActivity("admin_role_assigned", {
            target_user_id: userId,
            target_user_name: targetUser?.full_name || "Unknown",
            new_role: newRole,
          });
          toast({
            title: "Role Assigned",
            description: `User role has been set to ${newRole}.`,
          });
          fetchData();
        }
      }
    }

    setUpdatingRole(null);
  };

  const handleDeleteUser = async (userId: string, userName: string | null) => {
    setDeletingUser(userId);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("delete-user", {
        body: { user_id: userId },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      await logActivity("admin_user_deleted", {
        deleted_user_id: userId,
        deleted_user_name: userName || "Unknown",
      });
      toast({
        title: "User Deleted",
        description: `${userName || "User"} has been deleted successfully.`,
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user.",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  const handleViewActivity = (userId: string) => {
    setActivityUserFilter(userId);
    setActiveTab("activity");
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "moderator":
        return "default";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (authLoading || adminLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-secondary text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(192,155,76,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.12)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="kinetic-heading text-[18vw] text-primary opacity-[0.06]">
          ADMIN
        </span>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="kinetic-label inline-flex items-center gap-2 text-primary transition-transform hover:translate-x-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loadingData}
            className="border-primary text-primary hover:bg-primary hover:text-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="mx-auto max-w-6xl border-2 border-primary bg-[#08263F] p-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center border-2 border-primary bg-primary text-secondary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="kinetic-heading text-5xl text-white">
                  Admin Dashboard
                </h1>
                <p className="kinetic-label text-xs text-primary">
                  Manage users, assets, and activity
                </p>
              </div>
            </div>
            <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-secondary">
              <Link to="/admin/reports">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Link>
            </Button>
          </div>

          {/* Stats - simplified to match homepage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="text-center py-4">
              <p className="kinetic-heading text-5xl text-primary">
                {profiles.length}
              </p>
              <p className="kinetic-label mt-1 text-xs text-white/60">Total Users</p>
            </div>
            <div className="text-center py-4">
              <p className="kinetic-heading text-5xl text-primary">
                {userRoles.filter((r) => r.role === "admin").length}
              </p>
              <p className="kinetic-label mt-1 text-xs text-white/60">Admins</p>
            </div>
            <div className="text-center py-4">
              <p className="kinetic-heading text-5xl text-primary">
                {userRoles.filter((r) => r.role === "moderator").length}
              </p>
              <p className="kinetic-label mt-1 text-xs text-white/60">Moderators</p>
            </div>
            <div className="text-center py-4">
              <p className="kinetic-heading text-5xl text-primary">
                {ndaSignedCount}
              </p>
              <p className="kinetic-label mt-1 text-xs text-white/60">NDAs Signed</p>
            </div>
          </div>

          {/* Tabs - minimal styling */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 rounded-none border-2 border-primary bg-secondary p-1">
              <TabsTrigger value="users" className="gap-2 rounded-none font-mono text-xs uppercase text-white/60 data-[state=active]:bg-primary data-[state=active]:text-secondary">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2 rounded-none font-mono text-xs uppercase text-white/60 data-[state=active]:bg-primary data-[state=active]:text-secondary">
                <FileText className="w-4 h-4" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2 rounded-none font-mono text-xs uppercase text-white/60 data-[state=active]:bg-primary data-[state=active]:text-secondary">
                <Activity className="w-4 h-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <UserFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                ndaFilter={ndaFilter}
                onNdaFilterChange={setNdaFilter}
                dateRange={dateRangeFilter}
                onDateRangeChange={setDateRangeFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />

              <BulkActionsBar
                selectedUsers={selectedUsers}
                onClearSelection={() => setSelectedUserIds(new Set())}
                onActionComplete={fetchData}
                currentUserId={user?.id || ""}
              />

              {loadingData ? (
                <TableSkeleton rows={5} />
              ) : (
                <>
                  <div className="overflow-hidden overflow-x-auto border-2 border-primary bg-secondary">
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow className="border-primary hover:bg-white/[0.05]">
                          <TableHead className="w-12 font-mono uppercase text-primary">
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={toggleSelectAll}
                              aria-label="Select all"
                            />
                          </TableHead>
                          <TableHead className="font-mono uppercase text-primary">User</TableHead>
                          <TableHead className="font-mono uppercase text-primary">Company</TableHead>
                          <TableHead className="font-mono uppercase text-primary">Role</TableHead>
                          <TableHead className="font-mono uppercase text-primary">NDA</TableHead>
                          <TableHead className="font-mono uppercase text-primary">Joined</TableHead>
                          <TableHead className="text-right font-mono uppercase text-primary">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProfiles.map((profile) => {
                          const role = getUserRole(profile.user_id);
                          return (
                            <TableRow key={profile.id} className="border-white/20 hover:bg-white/[0.05]">
                              <TableCell>
                                <Checkbox
                                  checked={selectedUserIds.has(profile.user_id)}
                                  onCheckedChange={() => toggleSelectUser(profile.user_id)}
                                  aria-label={`Select ${profile.full_name || profile.email}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleViewUserDetail(profile)}
                                    className="flex items-center gap-3 transition-transform hover:translate-x-2"
                                  >
                                    <div className="flex h-10 w-10 items-center justify-center border-2 border-primary bg-primary font-mono font-bold text-secondary">
                                      {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                      <p className="font-mono text-sm font-bold uppercase text-white">
                                        {profile.full_name || "No name"}
                                      </p>
                                      <p className="text-xs text-white/50">
                                        {profile.email}
                                      </p>
                                    </div>
                                  </button>
                                </div>
                              </TableCell>
                              <TableCell className="text-white/70">
                                {profile.company_name || "-"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getRoleBadgeVariant(role)}>
                                  {role || "No role"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {profile.nda_signed ? (
                                  <Badge className="rounded-full border-primary bg-primary font-mono text-secondary">
                                    Signed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="rounded-full border-primary font-mono text-primary">
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-white/50">
                                {new Date(profile.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewUserDetail(profile)}
                                    className="border-primary text-primary hover:bg-primary hover:text-secondary"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <UserActionsDropdown
                                    user={profile}
                                    onResetNda={fetchData}
                                    onViewActivity={handleViewActivity}
                                    onDeleteUser={() => handleDeleteUser(profile.user_id, profile.full_name)}
                                    isDeleting={deletingUser === profile.user_id}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="font-mono text-sm text-white/50">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProfiles.length)} of {filteredProfiles.length} users
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                            className="border-primary text-primary hover:bg-primary hover:text-secondary"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="font-mono text-sm text-white/50">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                            className="border-primary text-primary hover:bg-primary hover:text-secondary"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="documents">
              <DocumentsManager />
            </TabsContent>

            {/* Activity Tab - Enhanced Audit Trail */}
            <TabsContent value="activity">
              <AuditTrail profiles={profiles} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        user={selectedUser}
        userRole={selectedUser ? getUserRole(selectedUser.user_id) : null}
      />
    </div>
  );
};

export default AdminDashboard;

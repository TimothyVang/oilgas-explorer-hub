import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
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
import { ArrowLeft, Shield, Users, RefreshCw, ChevronLeft, ChevronRight, FileText, Activity, CheckCircle, Eye } from "lucide-react";
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

  const fetchData = async () => {
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
  };

  useEffect(() => {
    if (isAdmin && user) {
      fetchData();
    }
  }, [isAdmin, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, ndaFilter]);

  useEffect(() => {
    setSelectedUserIds(new Set());
  }, [searchQuery, roleFilter, ndaFilter]);

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

  const getUserRole = (userId: string): "admin" | "moderator" | "user" | null => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role || null;
  };

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
      
      return matchesSearch && matchesRole && matchesNda;
    });
  }, [profiles, userRoles, searchQuery, roleFilter, ndaFilter]);

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
    <div className="min-h-screen bg-midnight relative overflow-hidden">
      
      {/* Background - matches homepage Hero */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,20,40,1)_0%,rgba(2,4,16,1)_100%)]" />
      
      {/* Single centered glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Bold background typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[15vw] font-black tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent opacity-[0.03]">
          ADMIN
        </span>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loadingData}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Admin Card - Clean glassmorphism */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-white/60 text-sm">
                Manage users, documents, and activity
              </p>
            </div>
          </div>

          {/* Stats - simplified to match homepage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="text-center py-4">
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                {profiles.length}
              </p>
              <p className="text-sm text-white/50 mt-1">Total Users</p>
            </div>
            <div className="text-center py-4">
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                {userRoles.filter((r) => r.role === "admin").length}
              </p>
              <p className="text-sm text-white/50 mt-1">Admins</p>
            </div>
            <div className="text-center py-4">
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                {userRoles.filter((r) => r.role === "moderator").length}
              </p>
              <p className="text-sm text-white/50 mt-1">Moderators</p>
            </div>
            <div className="text-center py-4">
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                {ndaSignedCount}
              </p>
              <p className="text-sm text-white/50 mt-1">NDAs Signed</p>
            </div>
          </div>

          {/* Tabs - minimal styling */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="users" className="gap-2 text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2 text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <FileText className="w-4 h-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2 text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white">
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
                  <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 overflow-x-auto">
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableHead className="w-12 text-gray-300">
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={toggleSelectAll}
                              aria-label="Select all"
                            />
                          </TableHead>
                          <TableHead className="text-gray-300">User</TableHead>
                          <TableHead className="text-gray-300">Company</TableHead>
                          <TableHead className="text-gray-300">Role</TableHead>
                          <TableHead className="text-gray-300">NDA</TableHead>
                          <TableHead className="text-gray-300">Joined</TableHead>
                          <TableHead className="text-right text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProfiles.map((profile) => {
                          const role = getUserRole(profile.user_id);
                          return (
                            <TableRow key={profile.id} className="border-white/10 hover:bg-white/5">
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
                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-white font-medium">
                                      {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                      <p className="font-medium text-white">
                                        {profile.full_name || "No name"}
                                      </p>
                                      <p className="text-sm text-gray-400">
                                        {profile.email}
                                      </p>
                                    </div>
                                  </button>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {profile.company_name || "-"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getRoleBadgeVariant(role)}>
                                  {role || "No role"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {profile.nda_signed ? (
                                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    Signed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-400">
                                {new Date(profile.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewUserDetail(profile)}
                                    className="text-gray-400 hover:text-white hover:bg-white/10"
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
                      <p className="text-sm text-gray-400">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProfiles.length)} of {filteredProfiles.length} users
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Documents Tab */}
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

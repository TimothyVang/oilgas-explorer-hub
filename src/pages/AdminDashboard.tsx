import { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Shield, Users, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  email?: string;
}

interface UserRole {
  user_id: string;
  role: "admin" | "moderator" | "user";
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

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
    
    // Fetch all profiles
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

    // Fetch all user roles
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

  const getUserRole = (userId: string): "admin" | "moderator" | "user" | null => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role || null;
  };

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
      // Remove role
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
          toast({
            title: "Role Removed",
            description: "User role has been removed.",
          });
          fetchData();
        }
      }
    } else {
      if (currentRole) {
        // Update existing role
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
          toast({
            title: "Role Updated",
            description: `User role has been updated to ${newRole}.`,
          });
          fetchData();
        }
      } else {
        // Insert new role
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
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-primary-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loadingData}
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Admin Card */}
        <div className="bg-card rounded-lg shadow-2xl p-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-destructive/20 rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage users and their roles
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-card-foreground">
                {profiles.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Shield className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-card-foreground">
                {userRoles.filter((r) => r.role === "admin").length}
              </p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-card-foreground">
                {userRoles.filter((r) => r.role === "moderator").length}
              </p>
              <p className="text-sm text-muted-foreground">Moderators</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingData ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => {
                    const role = getUserRole(profile.user_id);
                    const isCurrentUser = profile.user_id === user?.id;

                    return (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.full_name || "—"}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              You
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.email || "—"}
                        </TableCell>
                        <TableCell>{profile.company_name || "—"}</TableCell>
                        <TableCell>{profile.phone || "—"}</TableCell>
                        <TableCell>
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(role)}>
                            {role || "No Role"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={role || "none"}
                              onValueChange={(value) =>
                                handleRoleChange(profile.user_id, value)
                              }
                              disabled={isCurrentUser || updatingRole === profile.user_id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Role</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={isCurrentUser || deletingUser === profile.user_id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    <strong>{profile.full_name || profile.email || "this user"}</strong>?
                                    This action cannot be undone and will permanently remove their account
                                    and all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(profile.user_id, profile.full_name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-foreground/60 mt-8 text-sm">
          © {new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;

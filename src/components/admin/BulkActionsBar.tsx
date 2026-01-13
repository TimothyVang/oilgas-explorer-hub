import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, RotateCcw, ChevronDown, Loader2, X, Trash2, Shield, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/logActivity";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email?: string | null;
  nda_signed: boolean;
}

interface BulkActionsBarProps {
  selectedUsers: UserProfile[];
  onClearSelection: () => void;
  onActionComplete: () => void;
  currentUserId: string;
}

type RoleType = "admin" | "moderator" | "user" | "none";

export const BulkActionsBar = ({
  selectedUsers,
  onClearSelection,
  onActionComplete,
  currentUserId,
}: BulkActionsBarProps) => {
  const [resetNdaDialogOpen, setResetNdaDialogOpen] = useState(false);
  const [assignDocsDialogOpen, setAssignDocsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>("user");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter out current user from operations
  const usersExcludingCurrent = selectedUsers.filter(
    (u) => u.user_id !== currentUserId
  );

  // Filter out current user and users without NDA signed for reset action
  const usersWithNdaSigned = selectedUsers.filter(
    (u) => u.nda_signed && u.user_id !== currentUserId
  );

  const handleBulkResetNda = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (const user of usersWithNdaSigned) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            nda_signed: false,
            nda_signed_at: null,
          })
          .eq("user_id", user.user_id);

        if (error) throw error;

        await logActivity("admin_nda_reset", {
          target_user_id: user.user_id,
          target_user_email: user.email,
          bulk_action: true,
        });

        // Send notification email
        if (user.email) {
          try {
            await supabase.functions.invoke("send-email", {
              body: {
                to: user.email,
                subject: "NDA Status Reset - Action Required",
                template: "nda-reset",
                data: {
                  name: user.full_name || "Investor",
                },
              },
            });
          } catch (emailError) {
            console.error("Failed to send email to", user.email, emailError);
          }
        }

        successCount++;
      } catch (error) {
        console.error("Failed to reset NDA for", user.email, error);
        failCount++;
      }
    }

    toast({
      title: "Bulk NDA Reset Complete",
      description: `Successfully reset ${successCount} user(s)${failCount > 0 ? `, ${failCount} failed` : ""}. Notification emails sent.`,
    });

    setIsProcessing(false);
    setResetNdaDialogOpen(false);
    onClearSelection();
    onActionComplete();
  };

  const handleBulkAssignAllDocuments = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    // Get current user's ID for assigned_by field
    const { data: session } = await supabase.auth.getSession();
    const assignedBy = session?.session?.user?.id || currentUserId;

    // Fetch all documents first
    const { data: allDocs, error: docsError } = await supabase
      .from("investor_documents")
      .select("id");

    if (docsError || !allDocs) {
      toast({
        title: "Error",
        description: "Failed to fetch documents.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    for (const user of usersExcludingCurrent) {
      try {
        // Get existing assignments for this user
        const { data: existing } = await supabase
          .from("user_document_access")
          .select("document_id")
          .eq("user_id", user.user_id);

        const existingDocIds = new Set((existing || []).map((e) => e.document_id));

        // Filter to only new assignments
        const newAssignments = allDocs
          .filter((doc) => !existingDocIds.has(doc.id))
          .map((doc) => ({
            user_id: user.user_id,
            document_id: doc.id,
            assigned_by: assignedBy,
          }));

        if (newAssignments.length > 0) {
          const { error } = await supabase
            .from("user_document_access")
            .insert(newAssignments);

          if (error) throw error;

          await logActivity("admin_bulk_document_assign", {
            target_user_id: user.user_id,
            target_user_email: user.email,
            documents_assigned: newAssignments.length,
          });
        }

        successCount++;
      } catch (error) {
        console.error("Failed to assign documents to", user.email, error);
        failCount++;
      }
    }

    toast({
      title: "Bulk Document Assignment Complete",
      description: `Successfully assigned documents to ${successCount} user(s)${failCount > 0 ? `, ${failCount} failed` : ""}.`,
    });

    setIsProcessing(false);
    setAssignDocsDialogOpen(false);
    onClearSelection();
    onActionComplete();
  };

  const handleBulkRoleChange = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (const user of usersExcludingCurrent) {
      try {
        if (selectedRole === "none") {
          // Remove role
          const { error } = await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", user.user_id);

          if (error && error.code !== "PGRST116") throw error; // Ignore "no rows deleted" error

          await logActivity("admin_role_removed", {
            target_user_id: user.user_id,
            target_user_name: user.full_name || "Unknown",
            bulk_action: true,
          });
        } else {
          // Check if role exists
          const { data: existing } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.user_id)
            .single();

          if (existing) {
            // Update existing role
            const { error } = await supabase
              .from("user_roles")
              .update({ role: selectedRole })
              .eq("user_id", user.user_id);

            if (error) throw error;

            await logActivity("admin_role_changed", {
              target_user_id: user.user_id,
              target_user_name: user.full_name || "Unknown",
              previous_role: existing.role,
              new_role: selectedRole,
              bulk_action: true,
            });
          } else {
            // Insert new role
            const { error } = await supabase
              .from("user_roles")
              .insert({ user_id: user.user_id, role: selectedRole });

            if (error) throw error;

            await logActivity("admin_role_assigned", {
              target_user_id: user.user_id,
              target_user_name: user.full_name || "Unknown",
              new_role: selectedRole,
              bulk_action: true,
            });
          }
        }

        successCount++;
      } catch (error) {
        console.error("Failed to change role for", user.email, error);
        failCount++;
      }
    }

    toast({
      title: "Bulk Role Change Complete",
      description: `Successfully updated ${successCount} user(s)${failCount > 0 ? `, ${failCount} failed` : ""}.`,
    });

    setIsProcessing(false);
    setRoleChangeDialogOpen(false);
    onClearSelection();
    onActionComplete();
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    const { data: sessionData } = await supabase.auth.getSession();

    for (const user of usersExcludingCurrent) {
      try {
        const response = await supabase.functions.invoke("delete-user", {
          body: { user_id: user.user_id },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
        });

        if (response.error) throw new Error(response.error.message);
        if (response.data?.error) throw new Error(response.data.error);

        await logActivity("admin_user_deleted", {
          deleted_user_id: user.user_id,
          deleted_user_name: user.full_name || "Unknown",
          bulk_action: true,
        });

        successCount++;
      } catch (error) {
        console.error("Failed to delete user", user.email, error);
        failCount++;
      }
    }

    toast({
      title: "Bulk Delete Complete",
      description: `Successfully deleted ${successCount} user(s)${failCount > 0 ? `, ${failCount} failed` : ""}.`,
      variant: successCount > 0 ? "default" : "destructive",
    });

    setIsProcessing(false);
    setDeleteDialogOpen(false);
    onClearSelection();
    onActionComplete();
  };

  const openRoleChangeDialog = (role: RoleType) => {
    setSelectedRole(role);
    setRoleChangeDialogOpen(true);
  };

  const getRoleLabel = (role: RoleType) => {
    switch (role) {
      case "admin": return "Admin";
      case "moderator": return "Moderator";
      case "user": return "User";
      case "none": return "No Role";
    }
  };

  if (selectedUsers.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg mb-4 border border-primary/20">
        <div className="flex items-center gap-2">
          <span className="font-medium text-card-foreground">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Bulk Actions
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Document Actions */}
              <DropdownMenuItem
                onClick={() => setAssignDocsDialogOpen(true)}
                disabled={usersExcludingCurrent.length === 0}
              >
                <FileText className="w-4 h-4 mr-2" />
                Assign All Documents
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setResetNdaDialogOpen(true)}
                disabled={usersWithNdaSigned.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset NDA ({usersWithNdaSigned.length})
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Role Change Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={usersExcludingCurrent.length === 0}>
                  <Shield className="w-4 h-4 mr-2" />
                  Change Role
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => openRoleChangeDialog("admin")}>
                    <UserCog className="w-4 h-4 mr-2 text-red-500" />
                    Set as Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openRoleChangeDialog("moderator")}>
                    <UserCog className="w-4 h-4 mr-2 text-blue-500" />
                    Set as Moderator
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openRoleChangeDialog("user")}>
                    <UserCog className="w-4 h-4 mr-2 text-gray-500" />
                    Set as User
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openRoleChangeDialog("none")}>
                    <UserCog className="w-4 h-4 mr-2 text-gray-400" />
                    Remove Role
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Danger Zone */}
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                disabled={usersExcludingCurrent.length === 0}
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Users ({usersExcludingCurrent.length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk Reset NDA Dialog */}
      <AlertDialog open={resetNdaDialogOpen} onOpenChange={setResetNdaDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Reset NDA Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the NDA status for{" "}
              <strong>{usersWithNdaSigned.length} user(s)</strong>? They will need
              to sign the NDA again to access investor documents. Notification
              emails will be sent to each user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkResetNda} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Reset All NDAs"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Assign Documents Dialog */}
      <AlertDialog open={assignDocsDialogOpen} onOpenChange={setAssignDocsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign All Documents</AlertDialogTitle>
            <AlertDialogDescription>
              This will assign all investor documents to{" "}
              <strong>
                {usersExcludingCurrent.length} user(s)
              </strong>
              . Users who already have access to specific documents will not receive
              duplicate assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAssignAllDocuments}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Assign Documents"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Role Change Dialog */}
      <AlertDialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedRole === "none" ? "Remove Roles" : `Set Role to ${getRoleLabel(selectedRole)}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRole === "none" ? (
                <>
                  Are you sure you want to remove the role from{" "}
                  <strong>{usersExcludingCurrent.length} user(s)</strong>? They will
                  lose any special permissions associated with their current roles.
                </>
              ) : (
                <>
                  Are you sure you want to set the role to{" "}
                  <strong>{getRoleLabel(selectedRole)}</strong> for{" "}
                  <strong>{usersExcludingCurrent.length} user(s)</strong>?
                  {selectedRole === "admin" && (
                    <span className="block mt-2 text-amber-500">
                      Warning: Admin users have full access to all system features.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkRoleChange} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Delete Users</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-red-500 font-semibold">Warning: This action cannot be undone!</span>
              <br /><br />
              Are you sure you want to permanently delete{" "}
              <strong>{usersExcludingCurrent.length} user(s)</strong>? This will remove
              all their data including:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Profile information</li>
                <li>Document access records</li>
                <li>Activity history</li>
                <li>Authentication credentials</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {usersExcludingCurrent.length} User{usersExcludingCurrent.length !== 1 ? "s" : ""}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

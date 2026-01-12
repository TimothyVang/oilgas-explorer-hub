import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, RotateCcw, Activity, Trash2, Loader2 } from "lucide-react";
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

interface UserActionsDropdownProps {
  user: UserProfile;
  onResetNda: () => void;
  onViewActivity: (userId: string) => void;
  onDeleteUser: () => void;
  isDeleting: boolean;
}

export const UserActionsDropdown = ({
  user,
  onResetNda,
  onViewActivity,
  onDeleteUser,
  isDeleting,
}: UserActionsDropdownProps) => {
  const [resetNdaDialogOpen, setResetNdaDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isResettingNda, setIsResettingNda] = useState(false);

  const handleResetNda = async () => {
    setIsResettingNda(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          nda_signed: false,
          nda_signed_at: null,
        })
        .eq("user_id", user.user_id)
        .select();

      if (error) throw error;

      // Check if any rows were actually updated
      if (!data || data.length === 0) {
        throw new Error("Update failed - no rows affected. You may not have permission to update this user.");
      }

      await logActivity("admin_nda_reset", {
        target_user_id: user.user_id,
        target_user_email: user.email,
      });

      // Send notification email to user
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
          console.error("Failed to send NDA reset notification email:", emailError);
          // Don't fail the whole operation if email fails
        }
      }

      toast({
        title: "NDA Reset",
        description: `NDA status has been reset for ${user.full_name || user.email}. A notification email has been sent.`,
      });

      onResetNda();
    } catch (error) {
      console.error("Error resetting NDA:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset NDA status.",
        variant: "destructive",
      });
    } finally {
      setIsResettingNda(false);
      setResetNdaDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setResetNdaDialogOpen(true)}
            disabled={!user.nda_signed}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset NDA
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewActivity(user.user_id)}>
            <Activity className="w-4 h-4 mr-2" />
            View Activity
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reset NDA Confirmation Dialog */}
      <AlertDialog open={resetNdaDialogOpen} onOpenChange={setResetNdaDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset NDA Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the NDA status for{" "}
              <strong>{user.full_name || user.email}</strong>? They will need to
              sign the NDA again to access investor documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetNda} disabled={isResettingNda}>
              {isResettingNda ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset NDA"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{user.full_name || user.email}</strong>? This action cannot
              be undone. All user data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteDialogOpen(false);
                onDeleteUser();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, RotateCcw, ChevronDown, Loader2, X } from "lucide-react";
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

export const BulkActionsBar = ({
  selectedUsers,
  onClearSelection,
  onActionComplete,
  currentUserId,
}: BulkActionsBarProps) => {
  const [resetNdaDialogOpen, setResetNdaDialogOpen] = useState(false);
  const [assignDocsDialogOpen, setAssignDocsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState<{ id: string; title: string }[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Filter out current user and users without NDA signed for reset action
  const usersWithNdaSigned = selectedUsers.filter(
    (u) => u.nda_signed && u.user_id !== currentUserId
  );

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const { data, error } = await supabase
        .from("investor_documents")
        .select("id, title")
        .order("title");

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

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

    for (const user of selectedUsers.filter((u) => u.user_id !== currentUserId)) {
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setAssignDocsDialogOpen(true)}
                disabled={selectedUsers.filter((u) => u.user_id !== currentUserId).length === 0}
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
                {selectedUsers.filter((u) => u.user_id !== currentUserId).length} user(s)
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
    </>
  );
};

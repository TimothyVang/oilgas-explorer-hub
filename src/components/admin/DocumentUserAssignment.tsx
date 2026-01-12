import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface DocumentUserAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  onSuccess: () => void;
}

export const DocumentUserAssignment = ({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  onSuccess,
}: DocumentUserAssignmentProps) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<Set<string>>(new Set());
  const [initialAssignedUserIds, setInitialAssignedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, documentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users with NDA signed
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, nda_signed")
        .order("full_name", { ascending: true });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch current assignments for this document
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("user_document_access")
        .select("user_id")
        .eq("document_id", documentId);

      if (assignmentsError) throw assignmentsError;

      const assignedIds = new Set((assignmentsData || []).map((a) => a.user_id));
      setAssignedUserIds(assignedIds);
      setInitialAssignedUserIds(new Set(assignedIds));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = (userId: string) => {
    setAssignedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const ndaSignedUsers = users.filter((u) => u.nda_signed);
    setAssignedUserIds(new Set(ndaSignedUsers.map((u) => u.user_id)));
  };

  const handleDeselectAll = () => {
    setAssignedUserIds(new Set());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate additions and removals
      const toAdd = [...assignedUserIds].filter((id) => !initialAssignedUserIds.has(id));
      const toRemove = [...initialAssignedUserIds].filter((id) => !assignedUserIds.has(id));

      // Remove unassigned users
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("user_document_access")
          .delete()
          .eq("document_id", documentId)
          .in("user_id", toRemove);

        if (deleteError) throw deleteError;
      }

      // Add new assignments
      if (toAdd.length > 0) {
        const insertData = toAdd.map((userId) => ({
          user_id: userId,
          document_id: documentId,
          assigned_by: user.id,
        }));

        const { error: insertError } = await supabase
          .from("user_document_access")
          .insert(insertData);

        if (insertError) throw insertError;
      }

      // Log activity
      await logActivity("admin_document_updated", {
        document_id: documentId,
        document_title: documentTitle,
        users_added: toAdd.length,
        users_removed: toRemove.length,
      });

      toast({
        title: "Assignments updated",
        description: `Document access updated for ${assignedUserIds.size} users.`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving assignments:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save assignments.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const hasChanges = () => {
    if (assignedUserIds.size !== initialAssignedUserIds.size) return true;
    for (const id of assignedUserIds) {
      if (!initialAssignedUserIds.has(id)) return true;
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Users to Document</DialogTitle>
          <DialogDescription>
            Select which users can access "{documentTitle}". Only users who have
            signed the NDA will be able to view the document.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {assignedUserIds.size} of {users.filter((u) => u.nda_signed).length} users selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All (NDA)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg p-2">
                <div className="space-y-1">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                          !user.nda_signed ? "opacity-50" : ""
                        }`}
                      >
                        <Checkbox
                          id={user.id}
                          checked={assignedUserIds.has(user.user_id)}
                          onCheckedChange={() => handleToggleUser(user.user_id)}
                          disabled={!user.nda_signed}
                        />
                        <label
                          htmlFor={user.id}
                          className="flex-1 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {user.full_name || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email || "No email"}
                            </p>
                          </div>
                          {!user.nda_signed && (
                            <Badge variant="secondary" className="text-xs">
                              No NDA
                            </Badge>
                          )}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges()}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Assignments"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

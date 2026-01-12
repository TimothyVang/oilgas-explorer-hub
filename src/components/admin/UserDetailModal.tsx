import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  Activity,
  CheckCircle,
  Clock,
  Shield,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email?: string | null;
  phone: string | null;
  company_name: string | null;
  avatar_url: string | null;
  created_at: string;
  nda_signed: boolean;
  nda_signed_at: string | null;
}

interface ActivityLog {
  id: string;
  action: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

interface AssignedDocument {
  id: string;
  document_id: string;
  assigned_at: string;
  document: {
    title: string;
    description: string | null;
  };
}

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  userRole: string | null;
}

export const UserDetailModal = ({
  open,
  onOpenChange,
  user,
  userRole,
}: UserDetailModalProps) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [assignedDocs, setAssignedDocs] = useState<AssignedDocument[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchActivityLogs();
      fetchAssignedDocuments();
    }
  }, [open, user]);

  const fetchActivityLogs = async () => {
    if (!user) return;
    setLoadingActivity(true);
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("id, action, created_at, metadata")
        .eq("user_id", user.user_id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivityLogs(
        (data || []).map((log) => ({
          ...log,
          metadata: log.metadata as Record<string, unknown>,
        }))
      );
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchAssignedDocuments = async () => {
    if (!user) return;
    setLoadingDocs(true);
    try {
      const { data, error } = await supabase
        .from("user_document_access")
        .select(`
          id,
          document_id,
          assigned_at,
          document:investor_documents(title, description)
        `)
        .eq("user_id", user.user_id)
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      // Transform the data to match our interface
      const transformedData = (data || []).map((item: {
        id: string;
        document_id: string;
        assigned_at: string;
        document: { title: string; description: string | null };
      }) => ({
        id: item.id,
        document_id: item.document_id,
        assigned_at: item.assigned_at,
        document: item.document,
      }));
      setAssignedDocs(transformedData);
    } catch (error) {
      console.error("Error fetching assigned documents:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-100px)]">
          {/* User Header */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {user.full_name || "Unknown User"}
              </h3>
              <p className="text-muted-foreground">{user.email || "No email"}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getRoleBadgeVariant(userRole)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {userRole || "No Role"}
                </Badge>
                {user.nda_signed ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    NDA Signed
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    <Clock className="w-3 h-3 mr-1" />
                    NDA Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* User Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{user.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Company:</span>
              <span className="font-medium">{user.company_name || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined:</span>
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            {user.nda_signed && user.nda_signed_at && (
              <div className="flex items-center gap-2 text-sm col-span-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">NDA Signed:</span>
                <span className="font-medium">
                  {new Date(user.nda_signed_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Tabs for Activity and Documents */}
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="documents" className="flex-1 gap-2">
                <FileText className="w-4 h-4" />
                Assigned Documents ({assignedDocs.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 gap-2">
                <Activity className="w-4 h-4" />
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-4">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : assignedDocs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No documents assigned to this user</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">
                            {doc.document?.title || "Unknown Document"}
                          </p>
                          {doc.document?.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {doc.document.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.assigned_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              {loadingActivity ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No activity recorded for this user</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">
                          {formatAction(log.action)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

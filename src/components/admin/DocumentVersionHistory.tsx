import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Download, History, Loader2, Trash2, RotateCcw, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/logActivity";
import { UploadNewVersion } from "./UploadNewVersion";

interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_url: string;
  file_size: number | null;
  uploaded_by: string | null;
  change_notes: string | null;
  created_at: string;
  uploader_name?: string;
  uploader_email?: string;
}

interface DocumentVersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  currentVersion: number;
  onVersionChange?: () => void;
}

export const DocumentVersionHistory = ({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  currentVersion,
  onVersionChange,
}: DocumentVersionHistoryProps) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<DocumentVersion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<DocumentVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      // Fetch versions
      const { data: versionsData, error: versionsError } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("version_number", { ascending: false });

      if (versionsError) throw versionsError;

      // Fetch uploader profiles
      const uploaderIds = [...new Set((versionsData || []).map((v) => v.uploaded_by).filter(Boolean))];
      let profileMap = new Map<string, { full_name: string | null; email: string | null }>();

      if (uploaderIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", uploaderIds);

        (profiles || []).forEach((p) => {
          profileMap.set(p.user_id, { full_name: p.full_name, email: p.email });
        });
      }

      // Merge uploader info
      const versionsWithUploaders = (versionsData || []).map((v) => {
        const uploader = v.uploaded_by ? profileMap.get(v.uploaded_by) : null;
        return {
          ...v,
          uploader_name: uploader?.full_name || null,
          uploader_email: uploader?.email || null,
        };
      });

      setVersions(versionsWithUploaders);
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast({
        title: "Error",
        description: "Failed to load version history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && documentId) {
      fetchVersions();
    }
  }, [open, documentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDeleteVersion = (version: DocumentVersion) => {
    if (version.version_number === currentVersion) {
      toast({
        title: "Cannot delete",
        description: "You cannot delete the current version. Restore an older version first.",
        variant: "destructive",
      });
      return;
    }
    setVersionToDelete(version);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteVersion = async () => {
    if (!versionToDelete) return;

    setIsDeleting(true);
    try {
      // Delete file from storage
      const urlParts = versionToDelete.file_url.split("/investor-documents/");
      if (urlParts.length > 1) {
        await supabase.storage.from("investor-documents").remove([urlParts[1]]);
      }

      // Delete version record
      const { error } = await supabase
        .from("document_versions")
        .delete()
        .eq("id", versionToDelete.id);

      if (error) throw error;

      await logActivity("admin_document_version_deleted", {
        document_id: documentId,
        document_title: documentTitle,
        version_number: versionToDelete.version_number,
      });

      toast({
        title: "Version deleted",
        description: `Version ${versionToDelete.version_number} has been deleted.`,
      });

      fetchVersions();
    } catch (error) {
      console.error("Error deleting version:", error);
      toast({
        title: "Error",
        description: "Failed to delete version.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setVersionToDelete(null);
    }
  };

  const handleRestoreVersion = (version: DocumentVersion) => {
    if (version.version_number === currentVersion) {
      toast({
        title: "Already current",
        description: "This is already the current version.",
      });
      return;
    }
    setVersionToRestore(version);
    setRestoreDialogOpen(true);
  };

  const confirmRestoreVersion = async () => {
    if (!versionToRestore) return;

    setIsRestoring(true);
    try {
      // Update the main document to point to this version
      const { error } = await supabase
        .from("investor_documents")
        .update({
          file_url: versionToRestore.file_url,
          current_version: versionToRestore.version_number,
          file_size: versionToRestore.file_size,
        })
        .eq("id", documentId);

      if (error) throw error;

      await logActivity("admin_document_version_restored", {
        document_id: documentId,
        document_title: documentTitle,
        restored_version: versionToRestore.version_number,
      });

      toast({
        title: "Version restored",
        description: `Document restored to version ${versionToRestore.version_number}.`,
      });

      onVersionChange?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Error",
        description: "Failed to restore version.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
      setRestoreDialogOpen(false);
      setVersionToRestore(null);
    }
  };

  const handleUploadSuccess = () => {
    fetchVersions();
    onVersionChange?.();
    setUploadOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Version History
            </DialogTitle>
            <DialogDescription>
              View and manage versions for "{documentTitle}". Current version: {currentVersion}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload New Version
              </Button>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Version</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : versions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No versions found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    versions.map((version) => (
                      <TableRow key={version.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={version.version_number === currentVersion ? "default" : "outline"}
                            >
                              v{version.version_number}
                            </Badge>
                            {version.version_number === currentVersion && (
                              <span className="text-xs text-muted-foreground">(current)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {version.uploader_name || version.uploader_email || "System"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(version.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatFileSize(version.file_size)}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {version.change_notes || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <a
                                href={version.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            {version.version_number !== currentVersion && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRestoreVersion(version)}
                                title="Restore this version"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                            {version.version_number !== currentVersion && versions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteVersion(version)}
                                title="Delete this version"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Version Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete version {versionToDelete?.version_number} of "
              {documentTitle}"? This will permanently remove this version's file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVersion}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Version Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore version {versionToRestore?.version_number} of "
              {documentTitle}"? This will make this the current active version of the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestoreVersion} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                "Restore"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload New Version Dialog */}
      <UploadNewVersion
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        documentId={documentId}
        documentTitle={documentTitle}
        currentVersion={versions.length > 0 ? Math.max(...versions.map((v) => v.version_number)) : currentVersion}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
};

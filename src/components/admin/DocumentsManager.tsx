import { useState, useEffect } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Download, FileText, Loader2, RefreshCw, Users, History, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DocumentForm } from "./DocumentForm";
import { DocumentUserAssignment } from "./DocumentUserAssignment";
import { DocumentVersionHistory } from "./DocumentVersionHistory";
import { UploadNewVersion } from "./UploadNewVersion";
import { logActivity } from "@/lib/logActivity";

interface InvestorDocument {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  created_at: string;
  updated_at: string;
  current_version: number;
  file_size: number | null;
  assigned_count?: number;
}

export const DocumentsManager = () => {
  const [documents, setDocuments] = useState<InvestorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<InvestorDocument | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<InvestorDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assigningDocument, setAssigningDocument] = useState<InvestorDocument | null>(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [versionHistoryDocument, setVersionHistoryDocument] = useState<InvestorDocument | null>(null);
  const [uploadVersionOpen, setUploadVersionOpen] = useState(false);
  const [uploadVersionDocument, setUploadVersionDocument] = useState<InvestorDocument | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from("investor_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (docsError) throw docsError;

      // Fetch assignment counts for each document
      const { data: countData, error: countError } = await supabase
        .from("user_document_access")
        .select("document_id");

      if (countError) throw countError;

      // Count assignments per document
      const countMap = new Map<string, number>();
      (countData || []).forEach((item) => {
        countMap.set(item.document_id, (countMap.get(item.document_id) || 0) + 1);
      });

      // Merge counts into documents
      const docsWithCounts = (docsData || []).map((doc) => ({
        ...doc,
        assigned_count: countMap.get(doc.id) || 0,
      }));

      setDocuments(docsWithCounts);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAddDocument = () => {
    setEditingDocument(null);
    setFormOpen(true);
  };

  const handleEditDocument = (doc: InvestorDocument) => {
    setEditingDocument(doc);
    setFormOpen(true);
  };

  const handleDeleteClick = (doc: InvestorDocument) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleAssignUsers = (doc: InvestorDocument) => {
    setAssigningDocument(doc);
    setAssignmentOpen(true);
  };

  const handleViewVersionHistory = (doc: InvestorDocument) => {
    setVersionHistoryDocument(doc);
    setVersionHistoryOpen(true);
  };

  const handleUploadNewVersion = (doc: InvestorDocument) => {
    setUploadVersionDocument(doc);
    setUploadVersionOpen(true);
  };

  const deleteFileFromStorage = async (fileUrl: string) => {
    try {
      const urlParts = fileUrl.split("/investor-documents/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("investor-documents").remove([filePath]);
      }
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      // Delete file from storage first
      if (documentToDelete.file_url) {
        await deleteFileFromStorage(documentToDelete.file_url);
      }

      // Delete document record
      const { error } = await supabase
        .from("investor_documents")
        .delete()
        .eq("id", documentToDelete.id);

      if (error) throw error;

      // Log activity
      await logActivity("admin_document_deleted", {
        document_id: documentToDelete.id,
        document_title: documentToDelete.title,
      });

      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      });

      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileExtension = (url: string) => {
    const parts = url.split(".");
    return parts[parts.length - 1]?.toUpperCase() || "FILE";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Investor Documents</h3>
          <p className="text-sm text-muted-foreground">
            Manage documents available to investors who have signed the NDA.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAddDocument}>
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No documents yet</p>
                  <Button variant="link" size="sm" onClick={handleAddDocument}>
                    Add your first document
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {doc.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {getFileExtension(doc.file_url)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => handleViewVersionHistory(doc)}
                    >
                      <History className="w-3 h-3 mr-1" />
                      v{doc.current_version || 1}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={doc.assigned_count && doc.assigned_count > 0 ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAssignUsers(doc)}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {doc.assigned_count || 0} users
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(doc.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAssignUsers(doc)}>
                          <Users className="w-4 h-4 mr-2" />
                          Assign Users
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewVersionHistory(doc)}>
                          <History className="w-4 h-4 mr-2" />
                          Version History
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUploadNewVersion(doc)}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New Version
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditDocument(doc)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(doc)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Document Form Dialog */}
      <DocumentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        document={editingDocument}
        onSuccess={() => {
          fetchDocuments();
          if (editingDocument) {
            logActivity("admin_document_updated", {
              document_id: editingDocument.id,
              document_title: editingDocument.title,
            });
          } else {
            logActivity("admin_document_created", {});
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.title}"? This will
              permanently remove the document and its file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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

      {/* User Assignment Dialog */}
      {assigningDocument && (
        <DocumentUserAssignment
          open={assignmentOpen}
          onOpenChange={setAssignmentOpen}
          documentId={assigningDocument.id}
          documentTitle={assigningDocument.title}
          onSuccess={fetchDocuments}
        />
      )}

      {/* Version History Dialog */}
      {versionHistoryDocument && (
        <DocumentVersionHistory
          open={versionHistoryOpen}
          onOpenChange={setVersionHistoryOpen}
          documentId={versionHistoryDocument.id}
          documentTitle={versionHistoryDocument.title}
          currentVersion={versionHistoryDocument.current_version || 1}
          onSuccess={fetchDocuments}
        />
      )}

      {/* Upload New Version Dialog */}
      {uploadVersionDocument && (
        <UploadNewVersion
          open={uploadVersionOpen}
          onOpenChange={setUploadVersionOpen}
          documentId={uploadVersionDocument.id}
          documentTitle={uploadVersionDocument.title}
          currentVersion={uploadVersionDocument.current_version || 1}
          onSuccess={fetchDocuments}
        />
      )}
    </div>
  );
};

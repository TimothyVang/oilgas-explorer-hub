import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, File, X, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  nda_signed: boolean;
}

interface DocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: {
    id: string;
    title: string;
    description: string | null;
    file_url: string;
  } | null;
  onSuccess: () => void;
  preSelectedUserId?: string | null;
}

export const DocumentForm = ({
  open,
  onOpenChange,
  document,
  onSuccess,
  preSelectedUserId,
}: DocumentFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(document?.title || "");
  const [description, setDescription] = useState(document?.description || "");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User selection state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(preSelectedUserId || "");
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isEditing = !!document;

  // Fetch users with signed NDA for assignment
  useEffect(() => {
    if (open && !isEditing) {
      fetchUsers();
    }
  }, [open, isEditing]);

  // Update selectedUserId when preSelectedUserId changes
  useEffect(() => {
    if (preSelectedUserId) {
      setSelectedUserId(preSelectedUserId);
    }
  }, [preSelectedUserId]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, nda_signed")
        .eq("nda_signed", true)
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setIsUploading(false);
    setSelectedUserId(preSelectedUserId || "");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word, Excel, or PowerPoint file.",
        variant: "destructive",
      });
      return false;
    }

    // 20MB limit
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 20MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("investor-documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("investor-documents")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const deleteOldFile = async (fileUrl: string) => {
    try {
      // Extract the file path from the URL
      const urlParts = fileUrl.split("/investor-documents/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("investor-documents").remove([filePath]);
      }
    } catch (error) {
      console.error("Error deleting old file:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a document title.",
        variant: "destructive",
      });
      return;
    }

    if (!isEditing && !file) {
      toast({
        title: "File required",
        description: "Please upload a document file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let fileUrl = document?.file_url || "";

      // Upload new file if provided
      if (file) {
        // Delete old file if editing and replacing
        if (isEditing && document?.file_url) {
          await deleteOldFile(document.file_url);
        }
        fileUrl = await uploadFile(file);
      }

      if (isEditing) {
        const { error } = await supabase
          .from("investor_documents")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            file_url: fileUrl,
          })
          .eq("id", document.id);

        if (error) throw error;

        toast({
          title: "Document updated",
          description: "The document has been updated successfully.",
        });
      } else {
        // Insert the document
        const { data: newDoc, error } = await supabase
          .from("investor_documents")
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            file_url: fileUrl,
          })
          .select("id")
          .single();

        if (error) throw error;

        // If a user is selected, create the assignment
        if (selectedUserId && newDoc && user) {
          const { error: assignError } = await supabase
            .from("user_document_access")
            .insert({
              document_id: newDoc.id,
              user_id: selectedUserId,
              assigned_by: user.id,
            });

          if (assignError) {
            console.error("Error assigning document:", assignError);
            toast({
              title: "Document added",
              description: "Document was added but assignment failed. You can assign it manually.",
              variant: "destructive",
            });
          } else {
            const assignedUser = users.find(u => u.user_id === selectedUserId);
            toast({
              title: "Document added & assigned",
              description: `Document assigned to ${assignedUser?.full_name || assignedUser?.email || "user"}.`,
            });
          }
        } else {
          toast({
            title: "Document added",
            description: "The document has been added successfully.",
          });
        }
      }

      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save document.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(document?.title || "");
      setDescription(document?.description || "");
      setFile(null);
      setSelectedUserId(preSelectedUserId || "");
    }
  }, [open, document, preSelectedUserId]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Document" : "Add New Document"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the document details. Upload a new file to replace the existing one."
                : "Upload a new investor document. Supported formats: PDF, Word, Excel, PowerPoint."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Investment Deck Q4 2024"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document..."
                rows={3}
              />
            </div>

            {/* User Assignment (only for new documents) */}
            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="assign-user">
                  <User className="w-4 h-4 inline mr-1" />
                  Assign to User (optional)
                </Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a user (NDA signed only)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No assignment</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.full_name || u.email || "Unknown user"}
                        {u.email && u.full_name && (
                          <span className="text-muted-foreground ml-1">({u.email})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only users who have signed the NDA can be assigned documents.
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label>
                {isEditing ? "Replace File (optional)" : "Upload File *"}
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <File className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop a file here, or
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, Word, Excel, PowerPoint (max 20MB)
                    </p>
                  </>
                )}
              </div>
              {isEditing && document?.file_url && !file && (
                <p className="text-xs text-muted-foreground">
                  Current file will be kept if no new file is uploaded.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Uploading..."}
                </>
              ) : isEditing ? (
                "Update Document"
              ) : (
                "Add Document"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Lock, CheckCircle, ExternalLink, Download } from "lucide-react";
import { logActivity } from "@/lib/logActivity";

interface InvestorDocument {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  created_at: string;
}

interface ProfileNdaStatus {
  nda_signed: boolean;
  nda_signed_at: string | null;
}

const InvestorDocuments = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ndaStatus, setNdaStatus] = useState<ProfileNdaStatus | null>(null);
  const [documents, setDocuments] = useState<InvestorDocument[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch NDA status from profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("nda_signed, nda_signed_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        setNdaStatus(profileData);
      }

      // If NDA is signed, fetch documents
      if (profileData?.nda_signed) {
        const { data: docsData, error: docsError } = await supabase
          .from("investor_documents")
          .select("*")
          .order("created_at", { ascending: false });

        if (docsError) {
          console.error("Error fetching documents:", docsError);
        } else {
          setDocuments(docsData || []);
        }
      }

      setLoadingData(false);
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDocumentAccess = async (document: InvestorDocument) => {
    await logActivity("document_access", {
      document_id: document.id,
      document_title: document.title,
    });
    window.open(document.file_url, "_blank");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-primary-foreground">Loading...</div>
      </div>
    );
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
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-lg shadow-2xl p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center">
              <FileText className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">
                Investor Documents
              </h1>
              <p className="text-muted-foreground">
                Access confidential investment materials
              </p>
            </div>
          </div>

          {loadingData ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : !ndaStatus?.nda_signed ? (
            /* NDA Not Signed - Show Requirement */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                NDA Required
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Before accessing investor documents, you must sign our Non-Disclosure Agreement. 
                This protects both parties and ensures confidentiality of sensitive information.
              </p>
              <Badge variant="outline" className="mb-6">
                Pending NDA Signature
              </Badge>
              <div className="mt-6">
                <Button className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Sign NDA via DocuSign
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  After signing, your access will be automatically granted within minutes.
                </p>
              </div>
            </div>
          ) : (
            /* NDA Signed - Show Documents */
            <div>
              <div className="flex items-center gap-2 mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-card-foreground font-medium">NDA Signed</p>
                  <p className="text-sm text-muted-foreground">
                    Signed on {ndaStatus.nda_signed_at ? new Date(ndaStatus.nda_signed_at).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No documents available at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-card-foreground border-b border-border pb-2">
                    Available Documents
                  </h3>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">
                            {doc.title}
                          </p>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground">
                              {doc.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Added {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDocumentAccess(doc)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-primary-foreground/60 mt-8 text-sm">
          © {new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default InvestorDocuments;

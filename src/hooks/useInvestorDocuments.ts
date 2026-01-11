import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

const DOCUSIGN_NDA_URL = "https://demo.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=fe62249a-9ae4-4146-9473-730060811d53&env=demo&acct=31150f9e-848b-4280-bbd7-cc8dcbaecef2&v=2";

export const useInvestorDocuments = () => {
  const { user } = useAuth();
  const [ndaStatus, setNdaStatus] = useState<ProfileNdaStatus | null>(null);
  const [documents, setDocuments] = useState<InvestorDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Check NDA Status
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

        // 2. Fetch Documents assigned to user via user_document_access (if NDA is signed)
        if (profileData?.nda_signed) {
          // First get the document IDs assigned to this user
          const { data: accessData, error: accessError } = await supabase
            .from("user_document_access")
            .select("document_id")
            .eq("user_id", user.id);

          if (accessError) {
            console.error("Error fetching document access:", accessError);
          } else if (accessData && accessData.length > 0) {
            // Get the actual documents using the assigned document IDs
            const documentIds = accessData.map((a) => a.document_id);
            const { data: docsData, error: docsError } = await supabase
              .from("investor_documents")
              .select("*")
              .in("id", documentIds)
              .order("created_at", { ascending: false });

            if (docsError) {
              console.error("Error fetching documents:", docsError);
            } else {
              setDocuments(docsData || []);
            }
          } else {
            // No documents assigned to this user
            setDocuments([]);
          }
        }
      } catch (error) {
        console.error("Error fetching investor documents data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSignNda = async () => {
    await logActivity("nda_sign_initiated", { redirect_url: DOCUSIGN_NDA_URL });
    window.open(DOCUSIGN_NDA_URL, "_blank");
  };

  const handleDocumentAccess = async (doc: InvestorDocument) => {
    await logActivity("document_access", {
      document_id: doc.id,
      document_title: doc.title,
    });
    window.open(doc.file_url, "_blank");
  };

  return {
    user,
    ndaStatus,
    documents,
    loading,
    handleSignNda,
    handleDocumentAccess,
    DOCUSIGN_NDA_URL,
  };
};

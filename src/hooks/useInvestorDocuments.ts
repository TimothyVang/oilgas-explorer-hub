import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/logActivity";
import { toast } from "@/hooks/use-toast";
import { demoInvestorDocuments, isDemoInvestorUser } from "@/lib/demoInvestorPortal";

export type DealRoomCategory =
  | "overview"
  | "pitch"
  | "financials"
  | "mapping"
  | "operations"
  | "field_videos"
  | "management";

export type InvestorAssetType = "document" | "video" | "image";

export interface InvestorDocument {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  category: DealRoomCategory;
  asset_type: InvestorAssetType;
  file_size: number | null;
  mime_type: string | null;
  original_filename: string | null;
  download_storage_path?: string | null;
  download_filename?: string | null;
  download_mime_type?: string | null;
  download_file_size?: number | null;
  thumbnail_path: string | null;
  sort_order: number;
  is_featured: boolean;
}

interface ProfileNdaStatus {
  nda_signed: boolean;
  nda_signed_at: string | null;
}

interface SignedUrlResponse {
  signed_url?: string;
  expires_at?: string;
  expires_in?: number;
  mode?: "preview" | "download_original";
  error?: string;
}

type AssetAccessMode = "preview" | "download_original";

const DOCUSIGN_NDA_URL = import.meta.env.VITE_DOCUSIGN_NDA_URL ||
  "https://demo.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=fe62249a-9ae4-4146-9473-730060811d53&env=demo&acct=31150f9e-848b-4280-bbd7-cc8dcbaecef2&v=2";

const LOAD_TIMEOUT_MS = 10000;
const ACCESS_TIMEOUT_MS = 15000;

const withTimeout = async <T,>(request: PromiseLike<T>, message: string, timeoutMs: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve(request), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export const useInvestorDocuments = () => {
  const { user } = useAuth();
  const [ndaStatus, setNdaStatus] = useState<ProfileNdaStatus | null>(null);
  const [documents, setDocuments] = useState<InvestorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accessLoadingId, setAccessLoadingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      if (isDemoInvestorUser(user)) {
        if (isMounted) {
          setNdaStatus({ nda_signed: true, nda_signed_at: "2026-05-24T00:00:00Z" });
          setDocuments(demoInvestorDocuments as InvestorDocument[]);
          setLoadError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const { data: profileData, error: profileError } = await withTimeout(
          supabase
            .from("profiles")
            .select("nda_signed, nda_signed_at")
            .eq("user_id", user.id)
            .maybeSingle(),
          "File access check timed out.",
          LOAD_TIMEOUT_MS,
        );

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw new Error("Unable to verify your NDA status.");
        } else {
          if (isMounted) setNdaStatus(profileData);
        }

        if (profileData?.nda_signed) {
          const { data: accessData, error: accessError } = await withTimeout(
            supabase
              .from("user_document_access")
              .select("document_id")
              .eq("user_id", user.id),
            "Assigned file check timed out.",
            LOAD_TIMEOUT_MS,
          );

          if (accessError) {
            console.error("Error fetching document access:", accessError);
            throw new Error("Unable to load your assigned files.");
          } else if (accessData && accessData.length > 0) {
            const documentIds = accessData.map((a) => a.document_id);
            const { data: docsData, error: docsError } = await withTimeout(
              supabase
                .from("investor_documents")
                .select("id, title, description, created_at, category, asset_type, file_size, mime_type, original_filename, download_storage_path, download_filename, download_mime_type, download_file_size, thumbnail_path, sort_order, is_featured")
                .in("id", documentIds)
                .order("category", { ascending: true })
                .order("sort_order", { ascending: true })
                .order("created_at", { ascending: false }),
              "File details load timed out.",
              LOAD_TIMEOUT_MS,
            );

            if (docsError) {
              console.error("Error fetching documents:", docsError);
              throw new Error("Unable to load your assigned files.");
            } else {
              if (isMounted) setDocuments((docsData || []) as InvestorDocument[]);
            }
          } else {
            if (isMounted) setDocuments([]);
          }
        } else {
          if (isMounted) setDocuments([]);
        }
      } catch (error) {
        console.error("Error fetching investor documents data:", error);
        if (isMounted) {
          setDocuments([]);
          setLoadError("We couldn't load your files. Retry, or contact BAH if this continues.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user, reloadKey]);

  const retryLoad = () => setReloadKey((key) => key + 1);

  const handleSignNda = async () => {
    await logActivity("nda_sign_initiated", { redirect_url: DOCUSIGN_NDA_URL });
    window.open(DOCUSIGN_NDA_URL, "_blank");
  };

  const getDocumentAccessUrl = async (doc: InvestorDocument, mode: AssetAccessMode = "preview"): Promise<string | null> => {
    setAccessLoadingId(doc.id);
    try {
      if (isDemoInvestorUser(user)) {
        return `/demo-asset/${doc.id}`;
      }

      const { data, error } = await withTimeout(
        supabase.functions.invoke<SignedUrlResponse>("create-asset-access-url", {
          body: { document_id: doc.id, mode },
        }),
        "Secure file request timed out.",
        ACCESS_TIMEOUT_MS,
      );

      if (error || !data?.signed_url) {
        throw new Error(data?.error || error?.message || "Unable to open secure file.");
      }

      return data.signed_url;
    } catch (error) {
      console.error("Error requesting signed asset URL:", error);
      toast({
        title: "Access failed",
        description: error instanceof Error ? error.message : "Unable to open secure file.",
        variant: "destructive",
      });
      return null;
    } finally {
      setAccessLoadingId(null);
    }
  };

  const getDocumentDownloadUrl = (doc: InvestorDocument): Promise<string | null> => {
    return getDocumentAccessUrl(doc, "download_original");
  };

  const handleDocumentAccess = async (doc: InvestorDocument) => {
    const signedUrl = await getDocumentAccessUrl(doc);
    if (!signedUrl) return;

    if (!isDemoInvestorUser(user)) {
      await logActivity("document_access", {
        document_id: doc.id,
        document_title: doc.title,
      });
    }
    window.open(signedUrl, "_blank", "noopener,noreferrer");
  };

  return {
    user,
    ndaStatus,
    documents,
    loading,
    loadError,
    accessLoadingId,
    retryLoad,
    handleSignNda,
    handleDocumentAccess,
    getDocumentAccessUrl,
    getDocumentDownloadUrl,
    DOCUSIGN_NDA_URL,
  };
};

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HolographicCard } from "@/components/HolographicCard"; // Reusing the global card
import {
    FileText,
    Lock,
    CheckCircle,
    ExternalLink,
    Download,
    AlertCircle,
    ShieldCheck
} from "lucide-react";
import { logActivity } from "@/lib/logActivity";
import { motion } from "framer-motion";

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

export const DocumentsTab = () => {
    const { user } = useAuth();
    const [ndaStatus, setNdaStatus] = useState<ProfileNdaStatus | null>(null);
    const [documents, setDocuments] = useState<InvestorDocument[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch logic
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            // 1. Check NDA Status
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("nda_signed, nda_signed_at")
                .eq("user_id", user.id)
                .maybeSingle();

            if (profileError) console.error("Error fetching profile:", profileError);
            else setNdaStatus(profileData);

            // 2. Fetch Docs if NDA is signed
            if (profileData?.nda_signed) {
                const { data: docsData, error: docsError } = await supabase
                    .from("investor_documents")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (docsError) console.error("Error fetching documents:", docsError);
                else setDocuments(docsData || []);
            }

            setLoading(false);
        };

        fetchData();
    }, [user]);

    const handleSignNda = async () => {
        await logActivity("nda_sign_initiated", { redirect_url: DOCUSIGN_NDA_URL });
        window.open(DOCUSIGN_NDA_URL, "_blank");
    };

    const handleDocumentAccess = async (doc: InvestorDocument) => {
        await logActivity("document_access", { document_id: doc.id, document_title: doc.title });
        window.open(doc.file_url, "_blank");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // State 1: NDA REQUIRED
    if (!ndaStatus?.nda_signed) {
        return (
            <HolographicCard className="p-8 md:p-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto" delay={0.2}>
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 ring-1 ring-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <Lock className="w-10 h-10 text-red-400" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Restricted Access Level</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    This secure data vault requires a valid Non-Disclosure Agreement (NDA).
                    Please execute the digital agreement to unlock classified investor materials.
                </p>

                {/* Warning Alert */}
                <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-8 text-left flex gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-500 mb-1">Identity Verification Required</p>
                        <p className="text-xs text-amber-400/80">
                            You must use your registered email: <span className="text-white font-mono bg-white/10 px-1 rounded">{user?.email}</span>
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleSignNda}
                    className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] px-8 py-6 rounded-xl text-lg group"
                >
                    <ExternalLink className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
                    Initiate NDA Protocol
                </Button>
                <p className="text-xs text-gray-600 mt-4 uppercase tracking-widest">Powered by DocuSign Secure Systems</p>
            </HolographicCard>
        );
    }

    // State 2: NDA SIGNED / DOCUMENTS LIST
    return (
        <div className="space-y-6">
            {/* Header Info */}
            <HolographicCard className="p-4 flex items-center justify-between" delay={0.1}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <ShieldCheck className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Clearance Level: UNLOCKED</h3>
                        <p className="text-xs text-green-400">NDA Verified • {ndaStatus.nda_signed_at ? new Date(ndaStatus.nda_signed_at).toLocaleDateString() : 'Signed'}</p>
                    </div>
                </div>
            </HolographicCard>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No classified documents currently available.</p>
                    </div>
                ) : (
                    documents.map((doc, idx) => (
                        <DocumentCard
                            key={doc.id}
                            doc={doc}
                            onClick={() => handleDocumentAccess(doc)}
                            delay={0.2 + (idx * 0.1)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const DocumentCard = ({ doc, onClick, delay }: { doc: InvestorDocument, onClick: () => void, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        onClick={onClick}
        className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/40 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] overflow-hidden"
    >
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-white/5 to-transparent border border-white/5 group-hover:border-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div className="bg-white/5 text-xs px-2 py-1 rounded text-gray-500 font-mono">
                    PDF
                </div>
            </div>

            <h4 className="font-bold text-lg text-gray-200 group-hover:text-white mb-2 line-clamp-2">
                {doc.title}
            </h4>

            <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">
                {doc.description || "Confidential investment memorandum."}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-gray-600">
                    {new Date(doc.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center text-xs font-bold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    ACCESS DATA <Download className="w-3 h-3 ml-1" />
                </span>
            </div>
        </div>

        {/* Hover Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
    </motion.div>
);

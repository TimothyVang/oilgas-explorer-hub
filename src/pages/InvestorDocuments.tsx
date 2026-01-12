import { Link, Navigate } from "react-router-dom";
import { useInvestorDocuments } from "@/hooks/useInvestorDocuments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Lock, CheckCircle, ExternalLink, Download, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const InvestorDocuments = () => {
  const { loading: authLoading } = useAuth();
  const { 
    user, 
    ndaStatus, 
    documents, 
    loading: dataLoading, 
    handleSignNda, 
    handleDocumentAccess 
  } = useInvestorDocuments();

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          <p className="text-white/50 text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-midnight text-white overflow-hidden relative">
      
      {/* Background - matches homepage Hero */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,20,40,1)_0%,rgba(2,4,16,1)_100%)]" />
      
      {/* Single centered glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Bold background typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[12vw] font-black tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent opacity-[0.03]">
          DOCUMENTS
        </span>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-32">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Investor Documents
                </h1>
                <p className="text-white/60 text-sm">
                  Access confidential investment materials
                </p>
              </div>
            </div>
          </div>

          {dataLoading ? (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-white/50">Loading documents...</p>
              </div>
            </div>
          ) : !ndaStatus?.nda_signed ? (
            /* NDA Not Signed */
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-white/70" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                NDA Required
              </h2>
              <p className="text-white/60 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                Before accessing investor documents, you must sign our Non-Disclosure Agreement. 
                This protects both parties and ensures confidentiality of sensitive information.
              </p>
              
              {/* Email reminder alert */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 max-w-md mx-auto mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-amber-300 mb-1">
                      Use your registered email
                    </p>
                    <p className="text-sm text-amber-200/80">
                      Sign with: <strong className="text-amber-200">{user?.email}</strong>
                    </p>
                    <p className="text-xs text-amber-400/70 mt-1">
                      Using a different email will prevent automatic access.
                    </p>
                  </div>
                </div>
              </div>
              
              <Badge className="mb-6 bg-white/5 text-white/60 border-white/10 px-3 py-1">
                Pending NDA Signature
              </Badge>
              <div>
                <Button 
                  className="gap-2 bg-white text-midnight font-semibold hover:bg-white/90 px-6 py-5 text-base rounded-lg transition-all"
                  onClick={handleSignNda}
                >
                  <ExternalLink className="w-4 h-4" />
                  Sign NDA via DocuSign
                </Button>
                <p className="text-sm text-white/40 mt-4">
                  After signing, your access will be automatically granted within minutes.
                </p>
              </div>
            </div>
          ) : (
            /* NDA Signed - Show Documents */
            <div className="space-y-6">
              {/* NDA Status Badge */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Clearance Level: Unlocked</p>
                    <p className="text-xs text-emerald-400">
                      NDA Verified • {ndaStatus.nda_signed_at ? new Date(ndaStatus.nda_signed_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                  <FileText className="w-10 h-10 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 text-sm">
                    No documents have been assigned to your account yet.
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    Documents will appear here once an administrator assigns them to you.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documents.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 h-full flex flex-col group hover:border-white/20 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <Badge className="bg-white/5 text-white/50 border-white/10 text-[10px]">
                            PDF
                          </Badge>
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-xs text-white/50 mb-4 flex-1 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                          <p className="text-xs text-white/40">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDocumentAccess(doc)}
                            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs h-8 px-3"
                          >
                            <Download className="w-3 h-3" />
                            View
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-white/30 mt-12 text-sm">
          © {new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default InvestorDocuments;
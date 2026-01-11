import { Link, Navigate } from "react-router-dom";
import { useInvestorDocuments } from "@/hooks/useInvestorDocuments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Lock, CheckCircle, ExternalLink, Download, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { HolographicCard } from "@/components/HolographicCard";
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
      <div className="min-h-screen bg-[#020410] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-gray-400 text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#020410] text-white overflow-hidden relative">
      
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#020410]" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc=')] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[150px] animate-blob mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px] animate-blob mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
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
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
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
          <HolographicCard className="p-8 mb-8" variant="elevated">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,102,255,0.3)]">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Investor Documents
                </h1>
                <p className="text-gray-400">
                  Access confidential investment materials
                </p>
              </div>
            </div>
          </HolographicCard>

          {dataLoading ? (
            <HolographicCard className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-400">Loading documents...</p>
              </div>
            </HolographicCard>
          ) : !ndaStatus?.nda_signed ? (
            /* NDA Not Signed */
            <HolographicCard className="p-12 text-center" variant="elevated">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 flex items-center justify-center mx-auto mb-8">
                <Lock className="w-12 h-12 text-rose-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                NDA Required
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                Before accessing investor documents, you must sign our Non-Disclosure Agreement. 
                This protects both parties and ensures confidentiality of sensitive information.
              </p>
              
              {/* Email reminder alert */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 max-w-md mx-auto mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-amber-300 mb-1">
                      Use your registered email
                    </p>
                    <p className="text-sm text-amber-200/80">
                      Sign with: <strong className="text-amber-200">{user?.email}</strong>
                    </p>
                    <p className="text-xs text-amber-400/70 mt-2">
                      Using a different email will prevent automatic access.
                    </p>
                  </div>
                </div>
              </div>
              
              <Badge className="mb-8 bg-rose-500/10 text-rose-400 border-rose-500/20 px-4 py-1.5">
                Pending NDA Signature
              </Badge>
              <div>
                <Button 
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-6 text-lg font-semibold shadow-[0_0_30px_rgba(0,102,255,0.4)] hover:shadow-[0_0_40px_rgba(0,102,255,0.5)] transition-all"
                  onClick={handleSignNda}
                >
                  <ExternalLink className="w-5 h-5" />
                  Sign NDA via DocuSign
                </Button>
                <p className="text-sm text-gray-500 mt-6">
                  After signing, your access will be automatically granted within minutes.
                </p>
              </div>
            </HolographicCard>
          ) : (
            /* NDA Signed - Show Documents */
            <div className="space-y-6">
              {/* NDA Status Badge */}
              <HolographicCard className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Clearance Level: Unlocked</p>
                    <p className="text-sm text-emerald-400">
                      NDA Verified • {ndaStatus.nda_signed_at ? new Date(ndaStatus.nda_signed_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              </HolographicCard>

              {documents.length === 0 ? (
                <HolographicCard className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    No documents have been assigned to your account yet.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Documents will appear here once an administrator assigns them to you.
                  </p>
                </HolographicCard>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documents.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <HolographicCard 
                        className="p-6 h-full flex flex-col cursor-pointer group"
                        delay={index * 0.05}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <Badge className="bg-white/5 text-gray-400 border-white/10 text-[10px]">
                            PDF
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-gray-400 mb-4 flex-1 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                          <p className="text-xs text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDocumentAccess(doc)}
                            className="text-primary hover:text-white hover:bg-primary/20 gap-2"
                          >
                            <Download className="w-4 h-4" />
                            View
                          </Button>
                        </div>
                      </HolographicCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-12 text-sm">
          © {new Date().getFullYear()} BAH Oil and Gas. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default InvestorDocuments;

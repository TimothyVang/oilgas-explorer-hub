import { PageLoadingSkeleton } from "@/components/loading/PageLoadingSkeleton";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentsTab } from "@/components/dashboard/DocumentsTab";

const InvestorDocuments = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <PageLoadingSkeleton message="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-midnight text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,20,40,1)_0%,rgba(2,4,16,1)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden">
        <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-[12vw] font-black tracking-tighter text-transparent opacity-[0.03]">
          DEAL ROOM
        </span>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8 pt-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-bold text-white">Investor Deal Room</h1>
                <p className="text-sm text-white/60">
                  NDA-gated access to assigned BAH investor materials
                </p>
              </div>
            </div>
          </div>

          <DocumentsTab />
        </motion.div>

        <p className="mt-12 text-center text-sm text-white/30">
          © {new Date().getFullYear()} BAH Oil LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default InvestorDocuments;

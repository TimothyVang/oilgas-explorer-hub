import { PageLoadingSkeleton } from "@/components/loading/PageLoadingSkeleton";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, FileText, ShieldCheck, UserRound } from "lucide-react";
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
    <div className="relative min-h-screen overflow-hidden bg-secondary text-white">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(192,155,76,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.12)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 z-0 flex select-none items-center justify-center overflow-hidden">
        <span className="kinetic-heading text-[16vw] text-primary opacity-[0.06]">FILES</span>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 md:px-6 md:py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-col gap-3 border-2 border-primary bg-[#08263F] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            to="/dashboard"
            className="kinetic-label inline-flex min-h-[44px] items-center gap-2 text-xs text-primary transition-transform hover:translate-x-2 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 border border-primary/40 bg-secondary px-3 py-2">
            <UserRound className="h-4 w-4 text-primary" />
            <span className="max-w-[220px] truncate font-mono text-xs uppercase text-white/70">
              {user.email || "Investor"}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full flex-1"
        >
          <section className="mb-6 grid gap-4 border-2 border-primary bg-[#08263F] p-5 md:grid-cols-[1fr_auto] md:items-end md:p-6">
            <div>
              <p className="kinetic-label text-xs text-primary">Private investor files</p>
              <h1 className="kinetic-heading mt-2 text-5xl text-white md:text-7xl">Investor Files</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65 md:text-base">
                Open the files BAH has assigned to you.
              </p>
            </div>
            <div className="grid grid-cols-2 border-2 border-primary md:w-[360px]">
              <div className="border-r-2 border-primary p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center border border-primary bg-primary text-secondary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="kinetic-label text-[10px] text-white/50">Access</p>
                <p className="font-mono text-sm font-bold uppercase text-primary">Active</p>
              </div>
              <div className="p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center border border-primary bg-secondary text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="kinetic-label text-[10px] text-white/50">Files</p>
                <p className="font-mono text-sm font-bold uppercase text-primary">Secure</p>
              </div>
            </div>
          </section>

          <DocumentsTab />
        </motion.div>

        <p className="kinetic-label mt-10 pb-6 text-center text-xs text-primary/70">
          © {new Date().getFullYear()} BAH Oil LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default InvestorDocuments;

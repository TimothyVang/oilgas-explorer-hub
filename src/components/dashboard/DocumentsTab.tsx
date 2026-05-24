import { useMemo } from "react";
import { useInvestorDocuments, type DealRoomCategory, type InvestorDocument } from "@/hooks/useInvestorDocuments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HolographicCard } from "@/components/HolographicCard";
import {
  AlertCircle,
  BookOpen,
  Download,
  FileText,
  Image as ImageIcon,
  Map,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Table2,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { DocumentCardsSkeleton } from "@/components/loading/PageLoadingSkeleton";

const categories: Array<{ id: DealRoomCategory; label: string; description: string }> = [
  { id: "overview", label: "Overview", description: "Start here: thesis, sequence, and review path." },
  { id: "pitch", label: "Pitch", description: "Teasers, snapshots, and investment decks." },
  { id: "financials", label: "Financials", description: "Private economics, budget support, and capital schedule." },
  { id: "mapping", label: "Mapping", description: "Subsurface and technical mapping support." },
  { id: "operations", label: "Operations", description: "Operational context and supporting records." },
  { id: "field_videos", label: "Videos", description: "Private compressed field and operations clips." },
  { id: "management", label: "Management", description: "Technical leadership and management credentials." },
];

const assetTypeLabels = {
  document: "Document",
  video: "Video",
  image: "Image",
};

export const DocumentsTab = () => {
  const {
    user,
    ndaStatus,
    documents,
    loading,
    loadError,
    accessLoadingId,
    retryLoad,
    handleDocumentAccess,
  } = useInvestorDocuments();

  const featuredAsset = useMemo(
    () => documents.find((doc) => doc.is_featured) || documents[0],
    [documents],
  );

  const docsByCategory = useMemo(() => {
    return categories.reduce<Record<DealRoomCategory, InvestorDocument[]>>((acc, category) => {
      acc[category.id] = documents.filter((doc) => doc.category === category.id);
      return acc;
    }, {} as Record<DealRoomCategory, InvestorDocument[]>);
  }, [documents]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/10" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="h-3 w-24 rounded bg-white/10" />
            </div>
          </div>
        </div>
        <DocumentCardsSkeleton count={6} />
      </div>
    );
  }

  if (loadError) {
    return (
      <HolographicCard className="mx-auto flex max-w-2xl flex-col items-center justify-center p-8 text-center md:p-12" delay={0.2}>
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30">
          <AlertCircle className="h-10 w-10 text-amber-400" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-white">Deal Room Needs a Refresh</h2>
        <p className="mb-8 max-w-md text-gray-400">{loadError}</p>

        <Button
          onClick={retryLoad}
          className="rounded-xl bg-primary px-8 py-6 text-lg text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-primary/90"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Retry Deal Room
        </Button>
      </HolographicCard>
    );
  }

  if (!ndaStatus?.nda_signed) {
    return (
      <HolographicCard className="mx-auto flex max-w-2xl flex-col items-center justify-center p-8 text-center md:p-12" delay={0.2}>
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_30px_rgba(37,99,235,0.2)] ring-1 ring-primary/30">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-white">Deal Room Access Pending</h2>
        <p className="mb-8 max-w-md text-gray-400">
          Your account is active. BAH can turn on assigned files as soon as this investor profile is connected to the final Supabase access list.
        </p>

        <div className="mb-8 flex w-full gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-primary" />
          <div>
            <p className="mb-1 text-sm font-bold text-primary">Investor profile recognized</p>
            <p className="text-xs text-primary/80">
              Signed in as <span className="rounded bg-white/10 px-1 font-mono text-white">{user?.email}</span>. Refresh once BAH assigns files.
            </p>
          </div>
        </div>

        <Button onClick={retryLoad} className="rounded-xl bg-primary px-8 py-6 text-lg text-white hover:bg-primary/90">
          <RefreshCw className="mr-2 h-5 w-5" />
          Refresh Access
        </Button>
      </HolographicCard>
    );
  }

  return (
    <div className="space-y-6">
      <HolographicCard className="p-4" delay={0.1}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-2">
              <ShieldCheck className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Deal Room Unlocked</h3>
              <p className="text-xs text-green-400">
                Investor access verified • {ndaStatus.nda_signed_at ? new Date(ndaStatus.nda_signed_at).toLocaleDateString() : "Demo review"}
              </p>
            </div>
          </div>
          <Badge className="w-fit border-primary/40 bg-primary/10 text-primary">
            {documents.length} Assigned Asset{documents.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </HolographicCard>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-white/20" />
          <p className="mb-2 text-gray-400">No assets assigned yet.</p>
          <p className="text-sm text-gray-500">Your account is ready. BAH will assign private deal-room materials to this investor profile.</p>
        </div>
      ) : (
        <>
          {featuredAsset && (
            <HolographicCard className="p-6" delay={0.15}>
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Recommended first review</p>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">{featuredAsset.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-gray-400">
                    {featuredAsset.description || "Start here for the clearest path through the private investor materials."}
                  </p>
                </div>
                <Button
                  onClick={() => handleDocumentAccess(featuredAsset)}
                  disabled={accessLoadingId === featuredAsset.id}
                  className="rounded-xl bg-primary text-white hover:bg-primary/90"
                >
                  {accessLoadingId === featuredAsset.id ? "Opening..." : getAssetActionLabel(featuredAsset)}
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </HolographicCard>
          )}

          <Tabs defaultValue="overview" className="space-y-5">
            <div className="overflow-x-auto pb-2">
              <TabsList className="h-auto min-w-max border-white/10 bg-white/5 p-1">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="gap-2 text-white/60 data-[state=active]:text-secondary">
                    {category.label}
                    <span className="rounded-full bg-secondary/20 px-1.5 text-[10px] text-current">
                      {docsByCategory[category.id]?.length || 0}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wide text-white/80">{category.label}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>

                {docsByCategory[category.id]?.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {docsByCategory[category.id].map((doc, index) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        loading={accessLoadingId === doc.id}
                        onClick={() => handleDocumentAccess(doc)}
                        delay={0.08 * index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-gray-500">
                    No assigned assets in this section yet.
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
};

const DocumentCard = ({ doc, onClick, delay, loading }: { doc: InvestorDocument; onClick: () => void; delay: number; loading: boolean }) => {
  const Icon = getAssetIcon(doc);
  const label = assetTypeLabels[doc.asset_type] || "Asset";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onClick}
      disabled={loading}
      aria-label={`Open ${doc.title}`}
      className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-white/5 bg-white/5 p-5 text-left transition-all duration-300 hover:border-primary/40 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] disabled:cursor-wait disabled:opacity-70"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-lg border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-3 transition-colors group-hover:border-primary/20">
            <Icon className="h-6 w-6 text-gray-400 transition-colors group-hover:text-primary" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="border-white/20 text-white/60">{label}</Badge>
            {doc.is_featured && <Badge className="bg-primary text-secondary">Featured</Badge>}
          </div>
        </div>

        <h4 className="mb-2 line-clamp-2 text-lg font-bold text-gray-200 transition-colors group-hover:text-white">
          {doc.title}
        </h4>

        <p className="mb-6 line-clamp-3 flex-1 text-sm text-gray-500">
          {doc.description || "Confidential investor asset available in the BAH deal room."}
        </p>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="text-xs text-gray-600">
            <p>{formatFileSize(doc.file_size)}</p>
            <p>{new Date(doc.created_at).toLocaleDateString()}</p>
          </div>
          <span className="flex items-center text-xs font-bold uppercase text-primary transition-all duration-300 group-hover:translate-x-1">
            {loading ? "Opening" : getAssetActionLabel(doc)}
            {doc.asset_type === "video" ? <PlayCircle className="ml-1 h-3 w-3" /> : <Download className="ml-1 h-3 w-3" />}
          </span>
        </div>
      </div>
    </motion.button>
  );
};

const getAssetIcon = (doc: InvestorDocument) => {
  if (doc.asset_type === "video") return PlayCircle;
  if (doc.asset_type === "image") return ImageIcon;
  if (doc.mime_type?.includes("spreadsheet") || doc.original_filename?.match(/\.(xls|xlsx)$/i)) return Table2;
  if (doc.category === "mapping") return Map;
  if (doc.category === "management") return UserRound;
  if (doc.category === "pitch") return BookOpen;
  return FileText;
};

const getAssetActionLabel = (doc: InvestorDocument) => {
  if (doc.asset_type === "video") return "Play Video";
  if (doc.asset_type === "image") return "Open Image";
  if (doc.mime_type?.includes("spreadsheet") || doc.original_filename?.match(/\.(xls|xlsx)$/i)) return "Download Workbook";
  if (doc.original_filename?.match(/\.(ppt|pptx)$/i)) return "Open Deck";
  return "Open PDF";
};

const formatFileSize = (size: number | null) => {
  if (!size) return "Secure asset";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

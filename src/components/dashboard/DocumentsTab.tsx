import { useMemo, useState } from "react";
import { useInvestorDocuments, type DealRoomCategory, type InvestorDocument } from "@/hooks/useInvestorDocuments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HolographicCard } from "@/components/HolographicCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  BookOpen,
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
  { id: "overview", label: "Start Here", description: "Orientation, thesis, and first-review materials." },
  { id: "pitch", label: "Pitch", description: "Teasers, snapshots, and investment decks." },
  { id: "financials", label: "Financials", description: "Economics, budgets, and model support." },
  { id: "mapping", label: "Maps", description: "Lease, field, and technical mapping support." },
  { id: "operations", label: "Operations", description: "Operating notes, site context, and supporting records." },
  { id: "field_videos", label: "Field Videos", description: "Private field and operations clips." },
  { id: "management", label: "Team", description: "Management and technical leadership credentials." },
];

const reviewSteps = [
  { step: "1", title: "Start with the featured item", body: "This is the clearest first file for your review." },
  { step: "2", title: "Use sections to filter", body: "Only sections with assigned files are shown." },
  { step: "3", title: "Open files securely", body: "Each button creates a private link when you need it." },
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
    getDocumentAccessUrl,
  } = useInvestorDocuments();
  const [previewAsset, setPreviewAsset] = useState<{ doc: InvestorDocument; url: string } | null>(null);

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

  const handleAssetAccess = async (doc: InvestorDocument) => {
    const signedUrl = await getDocumentAccessUrl(doc);
    if (!signedUrl) return;

    setPreviewAsset({ doc, url: signedUrl });
  };

  const visibleCategories = useMemo(
    () => categories.filter((category) => docsByCategory[category.id]?.length),
    [docsByCategory],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse border-2 border-primary bg-[#08263F] p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary/20" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-primary/20" />
              <div className="h-3 w-24 bg-white/10" />
            </div>
          </div>
        </div>
        <DocumentCardsSkeleton count={6} />
      </div>
    );
  }

  if (loadError) {
    return (
      <HolographicCard className="mx-auto flex max-w-2xl flex-col items-center justify-center border-primary bg-[#08263F] p-8 text-center md:p-12" delay={0.2}>
        <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-primary bg-secondary text-primary">
          <AlertCircle className="h-8 w-8" />
        </div>

        <p className="kinetic-label mb-2 text-xs text-primary">Connection status</p>
        <h2 className="kinetic-heading mb-3 text-4xl text-white">Deal Room Needs a Refresh</h2>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-white/60">{loadError}</p>

        <Button
          onClick={retryLoad}
          className="rounded-none border-2 border-primary bg-primary px-8 py-6 font-mono text-xs font-bold uppercase text-secondary hover:bg-white"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Retry Deal Room
        </Button>
      </HolographicCard>
    );
  }

  if (!ndaStatus?.nda_signed) {
    return (
      <HolographicCard className="mx-auto flex max-w-2xl flex-col items-center justify-center border-primary bg-[#08263F] p-8 text-center md:p-12" delay={0.2}>
        <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-primary bg-secondary text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <p className="kinetic-label mb-2 text-xs text-primary">Access setup</p>
        <h2 className="kinetic-heading mb-3 text-4xl text-white">Deal Room Access Pending</h2>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-white/60">
          Your account is active. BAH will assign private deal-room files when your investor profile is ready for review.
        </p>

        <div className="mb-8 flex w-full gap-4 border-2 border-primary/40 bg-secondary p-4 text-left">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-primary" />
          <div>
            <p className="mb-1 text-sm font-bold text-primary">Investor profile recognized</p>
            <p className="text-xs text-primary/80">
              Signed in as <span className="rounded bg-white/10 px-1 font-mono text-white">{user?.email}</span>. Refresh once BAH assigns files.
            </p>
          </div>
        </div>

        <Button onClick={retryLoad} className="rounded-none border-2 border-primary bg-primary px-8 py-6 font-mono text-xs font-bold uppercase text-secondary hover:bg-white">
          <RefreshCw className="mr-2 h-5 w-5" />
          Refresh Access
        </Button>
      </HolographicCard>
    );
  }

  return (
    <div className="space-y-6">
      <Dialog open={Boolean(previewAsset)} onOpenChange={(open) => !open && setPreviewAsset(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-none border-2 border-primary bg-[#08263F] p-0 text-white sm:rounded-none">
          {previewAsset && (
            <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
              <AssetPreviewFrame doc={previewAsset.doc} url={previewAsset.url} />

              <DialogHeader className="border-l-0 border-primary p-6 text-left lg:border-l-2">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Secure browser preview</p>
                <DialogTitle className="kinetic-heading text-4xl leading-none text-white md:text-5xl">
                  {previewAsset.doc.title}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-white/65">
                  {previewAsset.doc.description || "Confidential BAH investor file prepared for private deal-room review."}
                </DialogDescription>
                <div className="border-t-2 border-primary/40 pt-4 font-mono text-xs uppercase text-white/45">
                  <p>{formatFileSize(previewAsset.doc.file_size)}</p>
                  <p>{previewAsset.doc.original_filename || "Private investor file"}</p>
                  <p>Preview links expire automatically. Reopen the file if the preview times out.</p>
                </div>
              </DialogHeader>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <HolographicCard className="border-primary bg-[#08263F] p-4" delay={0.1}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="border-2 border-primary bg-primary p-2 text-secondary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold uppercase text-white">Deal Room Unlocked</h3>
              <p className="font-mono text-xs uppercase text-primary">
                Investor access verified • {ndaStatus.nda_signed_at ? new Date(ndaStatus.nda_signed_at).toLocaleDateString() : "Demo review"}
              </p>
            </div>
          </div>
          <Badge className="w-fit rounded-none border-primary bg-secondary px-3 py-1 font-mono text-xs uppercase text-primary">
            {documents.length} File{documents.length === 1 ? "" : "s"} Assigned
          </Badge>
        </div>
      </HolographicCard>

      {documents.length === 0 ? (
        <div className="border-2 border-primary bg-[#08263F] p-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-primary" />
          <p className="kinetic-heading mb-2 text-3xl text-white">No assets assigned yet.</p>
          <p className="text-sm text-white/55">Your account is ready. BAH will assign private deal-room materials to this investor profile.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {reviewSteps.map((item) => (
              <div key={item.step} className="border-2 border-primary/50 bg-[#08263F] p-4">
                <p className="mb-2 font-mono text-xs font-bold uppercase text-primary">Step {item.step}</p>
                <h3 className="font-mono text-sm font-bold uppercase text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.body}</p>
              </div>
            ))}
          </div>

          {featuredAsset && (
            <HolographicCard className="border-primary bg-[#08263F] p-6" delay={0.15}>
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Recommended first review</p>
                  <h2 className="kinetic-heading text-4xl text-white md:text-5xl">{featuredAsset.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                    {featuredAsset.description || "Start here for the clearest path through the private investor materials."}
                  </p>
                </div>
                <Button
                  onClick={() => handleAssetAccess(featuredAsset)}
                  disabled={accessLoadingId === featuredAsset.id}
                  className="rounded-none border-2 border-primary bg-primary px-6 font-mono text-xs font-bold uppercase text-secondary hover:bg-white"
                >
                  {accessLoadingId === featuredAsset.id ? "Opening..." : getAssetActionLabel(featuredAsset)}
                  {featuredAsset.asset_type === "video" ? <PlayCircle className="ml-2 h-4 w-4" /> : <FileText className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </HolographicCard>
          )}

          <Tabs defaultValue={visibleCategories[0]?.id || "overview"} className="space-y-5">
            <div className="space-y-2 md:space-y-0">
              {visibleCategories.length > 3 && (
                <p className="kinetic-label text-[10px] text-primary/70 md:hidden">Swipe to view all assigned sections</p>
              )}
              <div className="relative">
                <div className="overflow-x-auto pb-2 pr-8 md:pr-0">
                  <TabsList className="h-auto min-w-max rounded-none border-2 border-primary bg-[#08263F] p-1">
                    {visibleCategories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="rounded-none border border-transparent px-4 py-2 font-mono text-xs font-bold uppercase text-white/60 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-secondary"
                      >
                        {category.label}
                        <span className="ml-2 border border-current px-1.5 text-[10px] text-current">
                          {docsByCategory[category.id]?.length || 0}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-secondary to-transparent md:hidden" />
              </div>
            </div>

            {visibleCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className="border-l-2 border-primary pl-4">
                  <h3 className="kinetic-heading text-3xl text-white">{category.label}</h3>
                  <p className="mt-1 text-sm text-white/50">{category.description}</p>
                </div>

                {docsByCategory[category.id]?.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {docsByCategory[category.id].map((doc, index) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        loading={accessLoadingId === doc.id}
                        onClick={() => handleAssetAccess(doc)}
                        delay={0.08 * index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-white/20 bg-[#08263F] p-8 text-center font-mono text-sm uppercase text-white/45">
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
      className="group relative flex min-h-[280px] flex-col overflow-hidden border-2 border-white/20 bg-[#08263F] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-secondary disabled:cursor-wait disabled:opacity-70"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(192,155,76,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.08)_1px,transparent_1px)] bg-[size:28px_28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between">
          <div className="border-2 border-primary/40 bg-secondary p-3 text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-secondary">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="rounded-none border-white/30 bg-secondary/70 font-mono text-[10px] uppercase text-white/70">{label}</Badge>
            {doc.is_featured && <Badge className="rounded-none bg-primary font-mono text-[10px] uppercase text-secondary">Featured</Badge>}
          </div>
        </div>

        <h4 className="mb-2 line-clamp-2 font-mono text-lg font-bold uppercase leading-tight text-white transition-colors group-hover:text-primary">
          {doc.title}
        </h4>

        <p className="mb-6 line-clamp-3 flex-1 text-sm leading-relaxed text-white/55">
          {doc.description || "Confidential investor asset available in the BAH deal room."}
        </p>

        <div className="flex items-center justify-between gap-3 border-t-2 border-primary/40 pt-4">
          <div className="font-mono text-[11px] uppercase text-white/45">
            <p>{formatFileSize(doc.file_size)}</p>
            <p>{new Date(doc.created_at).toLocaleDateString()}</p>
          </div>
          <span className="flex min-h-[34px] items-center border border-primary bg-primary px-3 font-mono text-[10px] font-bold uppercase text-secondary transition-colors duration-300 group-hover:bg-white">
            {loading ? "Opening" : getAssetActionLabel(doc)}
            {doc.asset_type === "video" ? <PlayCircle className="ml-1 h-3 w-3" /> : <FileText className="ml-1 h-3 w-3" />}
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
  if (doc.asset_type === "video") return "Preview Video";
  return "Preview";
};

const AssetPreviewFrame = ({ doc, url }: { doc: InvestorDocument; url: string }) => {
  if (doc.asset_type === "video" || doc.mime_type?.startsWith("video/")) {
    return (
      <div className="bg-black">
        <video
          src={url}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          playsInline
          preload="metadata"
          onContextMenu={(event) => event.preventDefault()}
          className="aspect-video h-full max-h-[70vh] w-full bg-black object-contain"
        >
          Your browser does not support secure video playback.
        </video>
      </div>
    );
  }

  if (doc.asset_type === "image" || doc.mime_type?.startsWith("image/")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black p-3">
        <img src={url} alt={doc.title} className="max-h-[70vh] w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="h-[70vh] bg-white">
      <iframe src={url} title={`${doc.title} preview`} className="h-full w-full border-0" />
    </div>
  );
};

const formatFileSize = (size: number | null) => {
  if (!size) return "Secure asset";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, FileText, Image as ImageIcon, PlayCircle, ShieldCheck, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoInvestorDocuments } from "@/lib/demoInvestorPortal";

const DemoAssetPreview = () => {
  const { assetId } = useParams();
  const asset = demoInvestorDocuments.find((doc) => doc.id === assetId);

  if (!asset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-6 text-white">
        <div className="max-w-lg border-2 border-primary bg-[#08263F] p-8 text-center">
          <h1 className="kinetic-heading text-4xl text-white">Asset Not Found</h1>
          <p className="mt-3 text-sm text-white/60">This asset is not in the assigned Deal Room list.</p>
          <Button asChild className="mt-6 rounded-full border-primary bg-primary text-secondary hover:bg-white">
            <Link to="/investor-documents">Back to Deal Room</Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = getIcon(asset);

  return (
    <div className="relative min-h-screen overflow-hidden bg-secondary px-4 py-8 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(192,155,76,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.12)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden">
        <span className="kinetic-heading text-[18vw] text-primary opacity-[0.06]">PREVIEW</span>
      </div>

      <main className="relative z-10 mx-auto max-w-5xl">
        <Link to="/investor-documents" className="kinetic-label mb-6 inline-flex items-center gap-2 text-primary transition-transform hover:translate-x-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Deal Room
        </Link>

        <section className="grid gap-6 border-2 border-primary bg-[#08263F] p-6 md:grid-cols-[1fr_320px] md:p-8">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="border-primary/40 bg-primary/10 text-primary">Investor Preview</Badge>
              <Badge variant="outline" className="border-white/20 text-white/70">{asset.category.replace("_", " ")}</Badge>
              <Badge variant="outline" className="border-white/20 text-white/70">{asset.asset_type}</Badge>
            </div>

            <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-primary bg-secondary text-primary">
              <Icon className="h-8 w-8" />
            </div>

            <p className="kinetic-label text-xs text-primary">Confidential asset preview</p>
            <h1 className="kinetic-heading mt-3 text-5xl text-white md:text-7xl">{asset.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/65">{asset.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Meta label="File" value={asset.original_filename || "Private asset"} />
              <Meta label="Size" value={formatFileSize(asset.file_size)} />
              <Meta label="Delivery" value="Signed URL ready" />
            </div>
          </div>

          <aside className="flex flex-col justify-between border border-primary/40 bg-secondary/70 p-5">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center border border-green-500/40 bg-green-500/10 text-green-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="font-mono text-lg font-bold uppercase text-white">Secure preview available</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                This preview confirms the investor flow, categories, access state, and asset metadata. Final private file delivery uses approved account access.
              </p>
            </div>

            <Button asChild className="mt-6 rounded-full border-primary bg-primary text-secondary hover:bg-white">
              <Link to="/investor-documents">
                Continue Review
                <Download className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </aside>
        </section>
      </main>
    </div>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-white/15 bg-white/[0.03] p-4">
    <p className="kinetic-label text-[10px] text-primary">{label}</p>
    <p className="mt-2 break-words text-sm font-semibold text-white/80">{value}</p>
  </div>
);

const getIcon = (asset: typeof demoInvestorDocuments[number]) => {
  if (asset.asset_type === "video") return PlayCircle;
  if (asset.asset_type === "image") return ImageIcon;
  if (asset.mime_type?.includes("spreadsheet") || asset.original_filename?.match(/\.(xls|xlsx)$/i)) return Table2;
  return FileText;
};

const formatFileSize = (size: number | null) => {
  if (!size) return "Private asset";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default DemoAssetPreview;

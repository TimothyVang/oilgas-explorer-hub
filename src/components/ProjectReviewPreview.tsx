import heroOilRigsImage from "@/assets/hero-oil-rigs.jpg";
import pumpJacksImage from "@/assets/pump-jacks.jpg";

const evidenceItems = [
  {
    title: "Field Photography",
    body: "Site documentation, equipment context, and field conditions captured for operating decisions.",
    image: pumpJacksImage,
    alt: "Oilfield equipment documented in the field",
  },
  {
    title: "Operating Data",
    body: "Records and operating context organized so the logic of each project remains clear.",
    image: heroOilRigsImage,
    alt: "Oil and gas field operations at dusk",
  },
];

const ProjectReviewPreview = () => {
  return (
    <section className="border-y-2 border-secondary bg-[#F8F6F0] text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 grid min-w-0 gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="min-w-0">
            <p className="kinetic-label mb-3 text-sm text-primary">IN THE FIELD</p>
            <h2 className="kinetic-heading text-[clamp(3rem,13vw,8rem)] leading-[0.82] sm:text-[clamp(3.5rem,8vw,8rem)]">
              <span className="block">A Working</span>
              <span className="block">Outfit.</span>
            </h2>
          </div>
          <p className="min-w-0 max-w-2xl font-body text-lg font-semibold leading-tight lg:text-xl">
            BAH's work is anchored in physical evidence: maps, well records, site documentation, and operating data, organized so the logic of each project is clear and verifiable.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {evidenceItems.map((item) => (
            <article key={item.title} className="overflow-hidden border-2 border-secondary bg-white shadow-[6px_6px_0_#C09B4C]">
              <img src={item.image} alt={item.alt} className="h-64 w-full object-cover" loading="lazy" decoding="async" />
              <div className="border-t-2 border-secondary p-5">
                <p className="kinetic-label text-xs text-primary">Evidence</p>
                <h3 className="kinetic-heading mt-3 text-4xl">{item.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-secondary/70">{item.body}</p>
              </div>
            </article>
          ))}

          <article className="border-2 border-secondary bg-secondary p-5 text-white shadow-[6px_6px_0_#C09B4C]">
            <div className="h-64 border-2 border-primary/70 bg-[linear-gradient(rgba(192,155,76,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.22)_1px,transparent_1px)] bg-[size:28px_28px] p-4">
              <div className="h-full border border-primary/50 bg-[#08263F]/80 p-4">
                <div className="h-2 w-28 bg-primary" />
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <span className="h-12 border border-primary/50" />
                  <span className="h-12 border border-primary/50" />
                  <span className="h-12 border border-primary/50" />
                </div>
                <div className="mt-8 h-1 w-full bg-primary/60" />
                <div className="mt-4 h-1 w-3/4 bg-primary/40" />
                <div className="mt-4 h-1 w-1/2 bg-primary/30" />
              </div>
            </div>
            <div className="pt-5">
              <p className="kinetic-label text-xs text-primary">Evidence</p>
              <h3 className="kinetic-heading mt-3 text-4xl">Map & Record Packages</h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-white/65">Maps and well records are organized for technical clarity without disclosing deal-specific data.</p>
            </div>
          </article>
        </div>

        <div className="mt-8 border-2 border-primary bg-primary p-5 text-secondary">
          <p className="kinetic-label text-xs">Public/private separation</p>
          <p className="mt-2 max-w-4xl font-body text-base font-bold leading-snug">
            Captions and public evidence describe capability only. Current-project materials and economics stay inside the secure portal.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProjectReviewPreview;

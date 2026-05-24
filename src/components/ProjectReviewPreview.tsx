import heroOilRigsImage from "@/assets/hero-oil-rigs.jpg";
import pumpJacksImage from "@/assets/pump-jacks.jpg";

const evidenceItems = [
  {
    title: "Field Photography",
    body: "Site documentation and equipment context captured for operating decisions.",
    image: pumpJacksImage,
    alt: "Oilfield equipment documented in the field",
  },
  {
    title: "Operating Data",
    body: "Operating context organized so the logic of each project remains clear.",
    image: heroOilRigsImage,
    alt: "Oil and gas field operations at dusk",
  },
];

const evidenceSignals = [
  ["Well Records", "Completion, production, and operating records tied to the project thesis."],
  ["Map Packages", "Maps and offsets organized for technical clarity without deal-specific disclosure."],
  ["Site Evidence", "Field photos and observations connect the record set to physical conditions."],
  ["Operating Context", "Access, equipment, vendor timing, and sequence constraints treated as execution inputs."],
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

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="overflow-hidden border-2 border-secondary bg-secondary text-white shadow-[8px_8px_0_#C09B4C]">
            <div className="relative h-[420px]">
              <img src={evidenceItems[0].image} alt={evidenceItems[0].alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 border-2 border-primary bg-secondary/90 p-5">
                <p className="kinetic-label text-xs text-primary">Field photography</p>
                <h3 className="kinetic-heading mt-2 text-5xl text-white">Physical evidence first.</h3>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-white/70">
                  Site documentation, equipment context, and field conditions support practical operating decisions.
                </p>
              </div>
            </div>
          </article>

          <div className="grid gap-5">
            <article className="border-2 border-secondary bg-secondary p-5 text-white shadow-[6px_6px_0_#C09B4C]">
              <div className="h-56 border-2 border-primary/70 bg-[linear-gradient(rgba(192,155,76,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(192,155,76,0.22)_1px,transparent_1px)] bg-[size:28px_28px] p-4">
                <div className="relative h-full overflow-hidden border border-primary/50 bg-[#08263F]/80 p-4">
                  <div className="absolute left-6 top-8 h-24 w-40 rotate-[-12deg] border-2 border-primary/60" />
                  <div className="absolute right-8 top-10 h-16 w-28 rotate-[8deg] border border-primary/50" />
                  <div className="absolute bottom-10 left-10 h-1 w-48 bg-primary/70" />
                  <div className="absolute bottom-16 left-16 h-1 w-32 bg-primary/40" />
                  <div className="absolute bottom-6 right-8 h-10 w-10 rounded-full border-2 border-primary" />
                </div>
              </div>
              <p className="kinetic-label mt-5 text-xs text-primary">Map & record packages</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-white/65">
                A technical record wall should feel organized, verifiable, and operational, not promotional.
              </p>
            </article>

            <article className="overflow-hidden border-2 border-secondary bg-white shadow-[6px_6px_0_#C09B4C]">
              <img src={evidenceItems[1].image} alt={evidenceItems[1].alt} className="h-44 w-full object-cover" loading="lazy" decoding="async" />
              <div className="border-t-2 border-secondary p-5">
                <p className="kinetic-label text-xs text-primary">Operating data</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-secondary/70">{evidenceItems[1].body}</p>
              </div>
            </article>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {evidenceSignals.map(([title, body]) => (
            <article key={title} className="border-2 border-secondary bg-white p-4 transition-transform hover:-translate-y-1 hover:shadow-[5px_5px_0_#C09B4C]">
              <p className="kinetic-label text-[10px] text-primary">Evidence signal</p>
              <h3 className="kinetic-heading mt-3 text-3xl">{title}</h3>
              <p className="mt-3 text-xs font-semibold leading-relaxed text-secondary/65">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 border-2 border-primary bg-primary p-5 text-secondary">
          <p className="kinetic-label text-xs">Public/private separation</p>
          <p className="mt-2 max-w-4xl font-body text-base font-bold leading-snug">
            Public captions describe operating capability only. Private project files remain inside the secure portal.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProjectReviewPreview;

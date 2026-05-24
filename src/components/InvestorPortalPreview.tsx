const bahStandards = [
  ["01", "Reservoir & Geology", "Technical review starts with the rock, reservoir behavior, well history, and supporting field evidence."],
  ["02", "Operations", "BAH looks at field work, production context, execution path, vendors, timing, and operating constraints."],
  ["03", "Costs", "Budget support and financial materials are reviewed with attention to spending sequence and execution timing."],
  ["04", "Maps & Records", "Mapping, technical files, and operating records are organized so investors can follow the project logic."],
  ["05", "Field Media", "Photos and videos are handled as private evidence for approved accounts, not public promotion."],
  ["06", "Investor Access", "BAH controls who sees which files, when access is granted, and what materials are assigned."],
];

const InvestorPortalPreview = () => {
  return (
    <section className="border-y-2 border-secondary bg-[#F8F6F0] text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 grid min-w-0 gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="min-w-0">
            <p className="kinetic-label mb-3 text-sm text-primary">How BAH Reviews Opportunities</p>
            <h2 className="kinetic-heading text-[clamp(3rem,13vw,8rem)] leading-[0.82] sm:text-[clamp(3.5rem,8vw,8rem)]">
              <span className="block">Rock.</span>
              <span className="block">Wells.</span>
              <span className="block">Numbers.</span>
            </h2>
          </div>
          <p className="min-w-0 max-w-2xl font-body text-lg font-semibold leading-tight lg:text-xl">
            A BAH review connects technical files, operating context, cost support, and investor materials so approved investors can evaluate each opportunity from several angles.
          </p>
        </div>

        <div className="grid border-2 border-secondary bg-secondary text-white md:grid-cols-3">
          {bahStandards.map(([index, title, body]) => (
            <article key={title} className="group border-b border-primary/40 p-5 transition-colors hover:bg-primary hover:text-secondary md:min-h-[230px] md:border-r md:[&:nth-child(3n)]:border-r-0 md:[&:nth-last-child(-n+3)]:border-b-0">
              <p className="kinetic-label text-xs text-primary group-hover:text-secondary">{index}</p>
              <h3 className="kinetic-heading mt-10 text-3xl transition-transform group-hover:translate-x-2 md:text-4xl">{title}</h3>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-white/65 group-hover:text-secondary/80">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 border-2 border-primary bg-primary p-5 text-secondary">
          <p className="kinetic-label text-xs">Investor portal</p>
          <p className="mt-2 max-w-4xl font-body text-base font-bold leading-snug">
            NDA prompts and assigned-material guidance stay inside the investor portal and approved account workflow.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InvestorPortalPreview;

const bahStandards = [
  ["01", "Maps & Records", "Technical maps, well files, production context, and operating records support the project thesis."],
  ["02", "Engineering & Geology", "Senior petroleum engineering and geology input frame reservoir behavior, reserves context, and redevelopment assumptions."],
  ["03", "Costed Work Plans", "AFE-based work planning connects field scope, vendor timing, mechanical needs, and capital discipline."],
  ["04", "Field Evidence", "Photos, videos, and site observations connect the file room to actual South Texas oilfield conditions."],
  ["05", "Operating Context", "Surface access, equipment, service availability, and sequence constraints are treated as execution inputs."],
  ["06", "Execution Path", "BAH and Trinity Sands Holdings connect ownership, operating accountability, and field work before development advances."],
];

const ProjectReviewPreview = () => {
  return (
    <section className="border-y-2 border-secondary bg-[#F8F6F0] text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 grid min-w-0 gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="min-w-0">
            <p className="kinetic-label mb-3 text-sm text-primary">Track Record and Evidence</p>
            <h2 className="kinetic-heading text-[clamp(3rem,13vw,8rem)] leading-[0.82] sm:text-[clamp(3.5rem,8vw,8rem)]">
              <span className="block">Maps.</span>
              <span className="block">Fieldwork.</span>
              <span className="block">Records.</span>
            </h2>
          </div>
          <p className="min-w-0 max-w-2xl font-body text-lg font-semibold leading-tight lg:text-xl">
            Public materials show BAH as a working outfit with real assets, real field context, and a disciplined path from technical evidence to field execution.
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
          <p className="kinetic-label text-xs">Public/private separation</p>
          <p className="mt-2 max-w-4xl font-body text-base font-bold leading-snug">
            Capability belongs on the public site. Project-specific files, financial materials, and execution documents stay inside the approved investor portal.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProjectReviewPreview;

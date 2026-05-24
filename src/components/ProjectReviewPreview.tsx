const bahStandards = [
  ["01", "Well & Production History", "Review includes available well history, production context, operating records, and field evidence."],
  ["02", "Engineering & Geology", "Technical review addresses reservoir behavior, redevelopment assumptions, reserves context, and field constraints."],
  ["03", "Cost Support", "Budget support shows spending sequence, timing, and execution assumptions tied to the work plan."],
  ["04", "Maps & Technical Records", "Maps, technical records, and operating records are organized so the project logic is clear."],
  ["05", "Field Evidence", "Photos, videos, and site context help connect the records to actual oilfield conditions."],
  ["06", "Execution Path", "BAH reviews sequence, timing, operating constraints, and practical field work before a project advances."],
];

const ProjectReviewPreview = () => {
  return (
    <section className="border-y-2 border-secondary bg-[#F8F6F0] text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 grid min-w-0 gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="min-w-0">
            <p className="kinetic-label mb-3 text-sm text-primary">Oilfield Records, Maps, and Costs</p>
            <h2 className="kinetic-heading text-[clamp(3rem,13vw,8rem)] leading-[0.82] sm:text-[clamp(3.5rem,8vw,8rem)]">
              <span className="block">Wells.</span>
              <span className="block">Maps.</span>
              <span className="block">Costs.</span>
            </h2>
          </div>
          <p className="min-w-0 max-w-2xl font-body text-lg font-semibold leading-tight lg:text-xl">
            BAH reviews the records, maps, technical assumptions, operating context, field evidence, and cost sequence behind an oil and gas project.
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
          <p className="kinetic-label text-xs">Field review sequence</p>
          <p className="mt-2 max-w-4xl font-body text-base font-bold leading-snug">
            Review the records, compare them against field conditions, test the cost sequence, then define the work needed to move the project forward.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProjectReviewPreview;

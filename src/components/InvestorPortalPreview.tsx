const bahStandards = [
  ["01", "Grounded Evaluation", "BAH favors practical oilfield review over broad marketing language."],
  ["02", "Technical Read", "Engineering, geology, and operating context shape how materials are reviewed."],
  ["03", "Capital Discipline", "Investor materials are organized around clear review and responsible disclosure."],
  ["04", "Confidential Handling", "Sensitive details are kept out of public pages and reserved for approved accounts."],
  ["05", "Direct Communication", "Approved investors receive focused access rather than a public data dump."],
  ["06", "Long-Term Credibility", "BAH presents opportunities with the measured tone expected in oil and gas investing."],
];

const InvestorPortalPreview = () => {
  return (
    <section className="border-y-2 border-secondary bg-[#F8F6F0] text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 grid min-w-0 gap-6 md:grid-cols-[0.95fr_1.05fr] md:items-end">
          <div className="min-w-0">
            <p className="kinetic-label mb-3 text-sm text-primary">The BAH difference</p>
            <h2 className="kinetic-heading break-words text-[clamp(3rem,13vw,8rem)] sm:text-[clamp(3.5rem,8vw,8rem)]">Measured, Private, Technical</h2>
          </div>
          <p className="min-w-0 max-w-2xl font-body text-lg font-semibold leading-tight md:text-xl">
            BAH should feel credible before the investor reaches a login form: oil and gas language, technical restraint, and a clear respect for confidential deal materials.
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
            Login instructions, NDA prompts, and assigned-material guidance now live on the investor login screen and inside approved accounts.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InvestorPortalPreview;

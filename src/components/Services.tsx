import { ArrowRight } from "lucide-react";

const services = [
  {
    id: "01",
    title: "Subsurface & Geoscience",
    summary: "Project work starts with maps, well control, reservoir context, and geologic interpretation in the South Texas conventional trend.",
    tags: ["Maps", "Well Control", "Geoscience"],
  },
  {
    id: "02",
    title: "Engineering & Reserves",
    summary: "Petroleum engineering and reserves assessment shape production assumptions, redevelopment logic, and practical operating limits.",
    tags: ["Engineering", "Reserves", "Production"],
  },
  {
    id: "03",
    title: "AFE Cost Control",
    summary: "Cost construction is built from field work scopes, vendor timing, mechanical requirements, and disciplined capital deployment.",
    tags: ["AFE", "Costs", "Capital"],
  },
  {
    id: "04",
    title: "Field Verification",
    summary: "Operating records are tested against field conditions, surface access, equipment realities, and execution constraints.",
    tags: ["Field", "Access", "Equipment"],
  },
  {
    id: "05",
    title: "Operator Execution",
    summary: "BAH advances projects with Trinity Sands Holdings as operator of record, linking planning, vendors, and field work.",
    tags: ["Operator", "Vendors", "Field Work"],
  },
];

const Services = () => {
  return (
    <section id="services" className="overflow-hidden bg-secondary px-4 py-20 text-white md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl min-w-0">
        <div className="mb-10 grid min-w-0 gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="min-w-0">
            <p className="kinetic-label text-sm text-primary">Development Approach</p>
            <h2 className="kinetic-heading mt-3 text-[clamp(3rem,13vw,8rem)] leading-[0.82] text-white sm:text-[clamp(3.75rem,8vw,8rem)]">
              <span className="block">How</span>
              <span className="block">We</span>
              <span className="block">Develop</span>
            </h2>
          </div>
          <p className="min-w-0 max-w-2xl font-body text-lg font-semibold leading-snug text-white/70 lg:justify-self-end lg:text-xl">
            BAH advances its own conventional redevelopment projects through a disciplined workflow: subsurface work, engineering, cost control, field verification, and operator execution.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {services.map((service) => (
            <article
              key={service.id}
              className="group flex min-h-[360px] min-w-0 flex-col overflow-hidden border-2 border-primary/70 bg-[#08263F] p-5 transition-colors duration-300 hover:bg-primary hover:text-secondary"
            >
              <div className="mb-10 flex items-center justify-between font-mono text-sm font-bold uppercase text-primary group-hover:text-secondary">
                <span>{service.id}</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="kinetic-heading min-w-0 break-words text-3xl transition-transform duration-300 group-hover:translate-x-2 md:text-4xl">
                {service.title}
              </h3>
              <p className="mt-5 flex-1 font-body text-sm font-semibold leading-relaxed text-white/70 group-hover:text-secondary/80 md:text-base">
                {service.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/30 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[-0.02em] text-white group-hover:border-secondary/40 group-hover:text-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

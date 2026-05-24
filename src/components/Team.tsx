import { BriefcaseBusiness, Gauge, HardHat } from "lucide-react";

const team = [
  {
    id: "01",
    initials: "BAH",
    name: "BAH Oil LLC",
    role: "Mineral Owner & Project Developer",
    body: "Originates, owns, and de-risks South Texas conventional opportunities before project-specific materials are released privately.",
    icon: BriefcaseBusiness,
  },
  {
    id: "02",
    initials: "TSH",
    name: "Trinity Sands Holdings",
    role: "Operator of Record",
    body: "Connects the development plan to field operations, vendor sequence, mechanical work, and execution accountability.",
    icon: HardHat,
  },
  {
    id: "03",
    initials: "OPS",
    name: "Technical & Field Oversight",
    role: "Engineering, Geology, Operations, and Execution",
    body: "Senior petroleum engineering and geology support works alongside operations and execution discipline for each project.",
    icon: Gauge,
  },
];

const Team = () => {
  return (
    <section id="governance" className="border-t-2 border-secondary bg-primary text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <h2 className="kinetic-heading break-words text-[clamp(3rem,13vw,9rem)] sm:text-[clamp(3.5rem,8vw,9rem)]">Governance</h2>
          <p className="font-body text-lg font-semibold leading-tight md:text-xl">
            BAH presents accountability by role: mineral ownership, operator-of-record execution, and senior technical and field oversight.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {team.map((member) => (
            <article key={member.id} className="group grid min-h-[360px] min-w-0 border-2 border-secondary bg-primary transition-colors duration-300 hover:bg-secondary hover:text-white">
              <div className="flex min-w-0 flex-col justify-between border-b-2 border-secondary p-5 group-hover:border-primary">
                <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-[-0.02em]">
                  <span>{member.id}</span>
                  <member.icon className="h-5 w-5" />
                </div>
                <div className="kinetic-heading text-6xl lg:text-7xl">{member.initials}</div>
              </div>
              <div className="flex min-w-0 flex-col justify-between p-5 md:p-6">
                <div>
                  <h3 className="kinetic-heading break-words text-4xl transition-transform duration-300 group-hover:translate-x-2 sm:text-5xl lg:text-6xl">
                    {member.name}
                  </h3>
                  <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[-0.02em] text-secondary/80 group-hover:text-primary">
                    {member.role}
                  </p>
                </div>
                <p className="mt-8 font-body text-base font-semibold leading-relaxed text-secondary/75 group-hover:text-white/75">
                  {member.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;

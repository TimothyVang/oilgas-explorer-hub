import { BriefcaseBusiness, HardHat } from "lucide-react";

const team = [
  {
    id: "01",
    initials: "BM",
    name: "Bryant Mook",
    role: "Senior Technical Advisor, Petroleum Engineering & Geology",
    body: "Supports technical review, field redevelopment, reserves, EOR, and production optimization for BAH Oil LLC opportunities.",
    icon: HardHat,
  },
  {
    id: "02",
    initials: "AG",
    name: "Alfredo Guilamo",
    role: "Chief Operating Officer",
    body: "Supports operations, coordination, and the investor access workflow for approved BAH Oil LLC materials.",
    icon: BriefcaseBusiness,
  },
];

const Team = () => {
  return (
    <section id="team" className="border-t-2 border-secondary bg-primary text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <h2 className="kinetic-heading break-words text-[clamp(3rem,13vw,9rem)] sm:text-[clamp(3.5rem,8vw,9rem)]">BAH Team</h2>
          <p className="font-body text-lg font-semibold leading-tight md:text-xl">
            BAH combines operating coordination with senior petroleum engineering and geology support for private oil and gas opportunities.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {team.map((member) => (
            <article key={member.id} className="group grid min-h-[360px] min-w-0 border-2 border-secondary bg-primary transition-colors duration-300 hover:bg-secondary hover:text-white lg:grid-cols-[180px_1fr]">
              <div className="flex min-w-0 flex-col justify-between border-b-2 border-secondary p-5 group-hover:border-primary lg:border-b-0 lg:border-r-2">
                <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-[-0.02em]">
                  <span>{member.id}</span>
                  <member.icon className="h-5 w-5" />
                </div>
                <div className="kinetic-heading text-7xl lg:text-8xl">{member.initials}</div>
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

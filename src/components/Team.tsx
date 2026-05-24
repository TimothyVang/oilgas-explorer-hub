import { Gauge, HardHat } from "lucide-react";

const team = [
  {
    id: "01",
    initials: "ENG",
    name: "Engineering & Geology",
    body: "Senior petroleum engineering and geology: well-record analysis, reservoir behavior, reserves context, EOR, and production optimization.",
    icon: Gauge,
  },
  {
    id: "02",
    initials: "OPS",
    name: "Operations & Execution",
    body: "Field coordination, scheduling, cost discipline, and execution planning that keeps project work sequenced and on plan.",
    icon: HardHat,
  },
];

const Team = () => {
  return (
    <section id="governance" className="border-t-2 border-secondary bg-primary text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="kinetic-label mb-3 text-sm">STRUCTURE</p>
            <h2 className="kinetic-heading break-words text-[clamp(3rem,13vw,9rem)] sm:text-[clamp(3.5rem,8vw,9rem)]">Built to operate, structured for alignment.</h2>
          </div>
          <p className="font-body text-lg font-semibold leading-tight md:text-xl">
            BAH Oil LLC holds the minerals; Trinity Sands Holdings LLC serves as operator of record. The structure connects ownership, operations, field coordination, and technical oversight so development decisions stay aligned from subsurface to surface.
          </p>
        </div>

        <div className="mb-8 border-2 border-secondary bg-white p-5">
          <p className="font-body text-lg font-semibold leading-tight md:text-xl">
            Team information is presented by function, not individual biography, to keep the public site focused on governance and execution capability.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
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

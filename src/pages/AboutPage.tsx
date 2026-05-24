import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const values = [
  ["01", "Well & Field Records", "BAH reviews available well history, operating records, maps, production context, and field evidence."],
  ["02", "Redevelopment Review", "Petroleum engineering and geology input supports reserves context, production assumptions, redevelopment planning, and field constraints."],
  ["03", "Cost & Execution", "Cost support, timing, field constraints, and execution sequence are reviewed before a project moves forward."],
];

const AboutPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-primary text-secondary">
      <Navigation />

      <section className="flex min-h-screen items-center border-b-2 border-secondary px-4 pt-28 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="kinetic-label mb-4 text-sm">About / BAH Oil LLC</p>
            <h1 className="kinetic-heading text-[clamp(3.75rem,10vw,9rem)]">Houston Oil & Gas Project Review</h1>
          </div>
          <div className="border-2 border-secondary bg-white p-6">
            <p className="font-body text-xl font-semibold leading-tight">
              BAH Oil LLC reviews oil and gas projects using well records, maps, petroleum engineering and geology input, operating context, cost support, field evidence, and redevelopment planning.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary text-white">
        <div className="mx-auto grid max-w-7xl border-x-2 border-primary md:grid-cols-3">
          {values.map(([index, title, description]) => (
            <article key={index} className="group border-b-2 border-primary p-6 transition-colors hover:bg-white/[0.05] md:border-b-0 md:border-r-2 md:last:border-r-0">
              <p className="kinetic-label text-xs text-primary">{index}</p>
              <h2 className="kinetic-heading mt-10 text-5xl text-white transition-transform group-hover:translate-x-4">{title}</h2>
              <p className="mt-6 text-sm font-semibold leading-relaxed text-white/65">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;

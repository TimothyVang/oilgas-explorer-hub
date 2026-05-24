import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const values = [
  ["01", "Defined Lane", "BAH focuses on shallow conventional vertical redevelopment opportunities in Zapata County and the South Texas trend."],
  ["02", "Technical Discipline", "Subsurface work, petroleum engineering, reserves context, field verification, and costed work plans drive development decisions."],
  ["03", "Operator Alignment", "BAH Oil LLC and Trinity Sands Holdings connect mineral ownership, operator-of-record execution, and disciplined capital deployment."],
];

const AboutPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-primary text-secondary">
      <Navigation />

      <section className="flex min-h-screen items-center border-b-2 border-secondary px-4 pt-28 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="kinetic-label mb-4 text-sm">About / BAH Oil LLC</p>
            <h1 className="kinetic-heading text-[clamp(3.75rem,10vw,9rem)]">South Texas Conventional Operator & Developer</h1>
          </div>
          <div className="border-2 border-secondary bg-white p-6">
            <p className="font-body text-xl font-semibold leading-tight">
              BAH Oil LLC originates, owns, de-risks, and develops conventional oil and gas projects in Zapata County with technical discipline and operator-grade cost control.
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

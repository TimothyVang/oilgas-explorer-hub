import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const values = [
  ["01", "Upstream Opportunities", "BAH reviews private oil and gas opportunities where geology, engineering, operations, and capital planning all matter."],
  ["02", "Technical Support", "Petroleum engineering and geology input supports reserves context, production assumptions, redevelopment planning, and field review."],
  ["03", "Controlled Investor Access", "Financial materials, maps, records, and field media are released only to approved accounts after BAH review."],
];

const AboutPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-primary text-secondary">
      <Navigation />

      <section className="flex min-h-screen items-center border-b-2 border-secondary px-4 pt-28 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="kinetic-label mb-4 text-sm">About / BAH Oil LLC</p>
            <h1 className="kinetic-heading text-[clamp(3.75rem,10vw,9rem)]">Houston Upstream Project Review</h1>
          </div>
          <div className="border-2 border-secondary bg-white p-6">
            <p className="font-body text-xl font-semibold leading-tight">
              BAH Oil LLC coordinates private upstream opportunity review around technical files, operating records, financial support, field materials, and approved investor access.
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

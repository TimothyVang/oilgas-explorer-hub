import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { siteConfig } from "@/constants/siteConfig";

const bahStrengths = [
  ["Find", "Defined South Texas opportunities are identified through records, maps, field context, and established conventional geology."],
  ["De-risk", "Geoscience, petroleum engineering, and field evidence shape each development plan before field work advances."],
  ["Develop", "Trinity Sands Holdings executes as operator of record, controlling sequence, timing, and cost."],
];

const trustPoints = ["Zapata County", "Conventional Vertical", "Known Horizons", "Operator of Record"];

const Hero = () => {
  return (
    <section id="home" className="relative isolate min-h-screen overflow-hidden bg-[#F8F6F0] px-4 pb-16 pt-28 text-secondary md:px-8 md:pb-20 md:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,53,85,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(18,53,85,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="pointer-events-none absolute right-0 top-24 h-40 w-40 rounded-full bg-primary/25 blur-3xl md:h-[360px] md:w-[360px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-primary/10 to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl min-w-0 items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="min-w-0"
        >
          <div className="mb-6 inline-flex flex-wrap items-center gap-2 border-2 border-secondary bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-[-0.02em] shadow-[5px_5px_0_#C09B4C]">
            <span>BAH Oil LLC</span>
            <span className="h-2 w-2 bg-primary" />
            <span>South Texas conventional oil & gas</span>
          </div>

          <h1 className="kinetic-heading max-w-4xl text-[clamp(3.1rem,13vw,7.25rem)] leading-[0.82] sm:text-[clamp(4rem,8vw,7.25rem)]">
            <span className="block">Find.</span>
            <span className="block">De-risk.</span>
            <span className="block">Develop.</span>
          </h1>

          <p className="mt-6 max-w-2xl font-body text-xl font-bold leading-tight text-secondary md:text-3xl">
            BAH Oil LLC - South Texas conventional oil & gas operator and developer.
          </p>

          <p className="mt-4 max-w-2xl font-body text-lg font-semibold leading-snug text-secondary/80 md:text-2xl">
            We originate, de-risk, and develop conventional oil and gas projects in the Zapata County trend, combining geoscience, petroleum engineering, and disciplined field execution.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${siteConfig.contact.email}?subject=BAH%20Oil%20Project%20Inquiry`}
              className="inline-flex min-h-[58px] items-center justify-center rounded-full border-2 border-secondary bg-secondary px-8 font-mono text-xs font-bold uppercase tracking-[-0.02em] text-white transition-transform hover:scale-105 hover:bg-[#08263F]"
            >
              Contact BAH
            </a>
            <Link
              to="/login"
              className="inline-flex min-h-[58px] items-center justify-center rounded-full border-2 border-secondary bg-white px-8 font-mono text-xs font-bold uppercase tracking-[-0.02em] text-secondary transition-transform hover:scale-105 hover:bg-primary"
            >
              Investor Login
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {trustPoints.map((point) => (
              <span key={point} className="inline-flex min-h-[28px] items-center border-2 border-secondary bg-primary px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[-0.02em] text-secondary">
                {point}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-w-0 border-2 border-secondary bg-white p-5 shadow-[6px_6px_0_#C09B4C] md:p-6 md:shadow-[10px_10px_0_#C09B4C] lg:max-w-[500px] lg:justify-self-end"
        >
          <div className="mb-5 flex items-start justify-between gap-4 border-b-2 border-secondary pb-5">
            <div>
              <p className="kinetic-label text-xs text-primary">Principal-Led Development</p>
              <h2 className="kinetic-heading mt-2 text-4xl md:text-5xl">An Operating Company That Finds and Builds Projects</h2>
            </div>
            <span className="rounded-full border-2 border-secondary bg-secondary px-3 py-1 font-mono text-xs font-bold uppercase text-white">
              BAH
            </span>
          </div>

          <div className="space-y-3">
            {bahStrengths.map(([title, body]) => (
              <article key={title} className="grid gap-3 border-2 border-secondary bg-[#F8F6F0] p-3 sm:grid-cols-[48px_1fr]">
                <div className="flex h-11 w-11 items-center justify-center bg-primary font-mono text-sm font-bold text-secondary">
                  {title.slice(0, 1)}
                </div>
                <div>
                  <h3 className="kinetic-heading text-2xl md:text-3xl">{title}</h3>
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-secondary/70 md:text-sm">{body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 border-2 border-primary bg-primary p-3 font-body text-sm font-bold leading-snug text-secondary">
            Public materials establish identity, competence, and credibility. Project-specific materials remain behind approved investor login.
          </div>
        </motion.aside>
      </div>
    </section>
  );
};

export default Hero;

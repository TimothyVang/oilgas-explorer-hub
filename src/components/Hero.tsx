import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { siteConfig } from "@/constants/siteConfig";

const bahStrengths = [
  ["Technical", "Petroleum engineering and geology perspective applied before materials are released."],
  ["Practical", "Oilfield operating context, cost awareness, and disciplined review standards."],
  ["Private", "Confidential investor communication handled through approved account access."],
];

const trustPoints = ["Technical diligence", "Operating context", "Private capital review"];

const Hero = () => {
  return (
    <section id="home" className="relative isolate min-h-screen overflow-hidden bg-[#F8F6F0] px-4 pb-16 pt-28 text-secondary md:px-8 md:pb-20 md:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,53,85,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(18,53,85,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="pointer-events-none absolute -right-32 top-24 h-[360px] w-[360px] rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-primary/10 to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6 inline-flex flex-wrap items-center gap-2 border-2 border-secondary bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-[-0.02em] shadow-[5px_5px_0_#C09B4C]">
            <span>BAH Oil LLC</span>
            <span className="h-2 w-2 bg-primary" />
            <span>Oil and gas opportunity review</span>
          </div>

          <h1 className="kinetic-heading max-w-4xl text-[clamp(4rem,8vw,7.25rem)]">
            Disciplined Oil & Gas Review
          </h1>

          <p className="mt-6 max-w-2xl font-body text-lg font-semibold leading-snug text-secondary/80 md:text-2xl">
            BAH Oil LLC brings technical perspective, operating discipline, and controlled investor communication to private oil and gas opportunity review.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${siteConfig.contact.email}?subject=Investor%20Portal%20Access%20Request`}
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
              <span key={point} className="border-2 border-secondary bg-primary px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[-0.02em] text-secondary">
                {point}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full border-2 border-secondary bg-white p-5 shadow-[10px_10px_0_#C09B4C] md:p-6 lg:max-w-[500px] lg:justify-self-end"
        >
          <div className="mb-5 flex items-start justify-between gap-4 border-b-2 border-secondary pb-5">
            <div>
              <p className="kinetic-label text-xs text-primary">BAH standard</p>
              <h2 className="kinetic-heading mt-2 text-4xl md:text-5xl">Built for Serious Review</h2>
            </div>
            <span className="rounded-full border-2 border-secondary bg-secondary px-3 py-1 font-mono text-[10px] font-bold uppercase text-white">
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
            Investor portal instructions now live on the login screen. This front page keeps the focus on BAH and its review standard.
          </div>
        </motion.aside>
      </div>
    </section>
  );
};

export default Hero;

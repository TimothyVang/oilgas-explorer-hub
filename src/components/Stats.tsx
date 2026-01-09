import { useRef } from "react";
import { useInView, useMotionValue, useSpring, motion } from "framer-motion";
import { useEffect } from "react";

const Stats = () => {
  const stats = [
    { value: 45, suffix: "+", label: "Years in Operation" },
    { value: 500, suffix: "K+", label: "Barrels Per Day" }, // Changed to 500 w/ K suffix for cleaner math
    { value: 35, suffix: "", label: "Countries Served" },
    { value: 12, suffix: "K", label: "Employees Worldwide" },
  ];

  return (
    <section className="py-24 bg-midnight relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 border-t border-b border-white/10 py-12">
          {stats.map((stat, index) => (
            <StatItem key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ stat, index }: { stat: any; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="text-center group">
      <div className="mb-2 flex justify-center items-baseline gap-1">
        <Counter value={stat.value} isInView={isInView} />
        <span className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          {stat.suffix}
        </span>
      </div>
      <p className="text-white/60 font-medium tracking-wide uppercase text-sm group-hover:text-primary transition-colors duration-300">
        {stat.label}
      </p>
    </div>
  );
};

const Counter = ({ value, isInView }: { value: number; isInView: boolean }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString();
      }
    });
  }, [springValue]);

  return (
    <span
      ref={ref}
      className="text-5xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-accent drop-shadow-2xl"
    >
      0
    </span>
  );
};

export default Stats;

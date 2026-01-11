import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-oil-rigs.jpg";

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-midnight flex items-center justify-center">

      {/* Abstract Background - Dark & Moody */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-midnight to-midnight" />
      </div>

      {/* THE RADICAL HERO TEXT */}
      <div className="relative z-10 w-full px-4 md:px-20">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <h1 className="text-[12vw] leading-[0.85] font-black uppercase text-center tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 relative z-20">
            Energy <br />
            <span className="relative">
              Evolved
              {/* Removed external Giphy GIF dependency - using CSS gradient animation instead */}
              <div className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient opacity-50 mix-blend-overlay">
                Evolved
              </div>
            </span>
          </h1>

          {/* Floating 3D Elements (Simulated with CSS for now or use the assets) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse-glow pointer-events-none" />
        </motion.div>

        <div className="mt-12 flex justify-between items-end w-full max-w-7xl mx-auto border-t border-white/10 pt-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 max-w-md text-lg font-light leading-relaxed"
          >
            Redefining exploration with AI-driven precision and sustainable infrastructure. Welcome to the new era of BAH Energy.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="w-[1px] h-12 bg-current" />
            <span className="text-xs uppercase tracking-widest">Scroll</span>
          </motion.button>
        </div>
      </div>

    </section>
  );
};

export default Hero;

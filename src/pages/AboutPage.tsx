import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Team from "@/components/Team";
import { ArrowDown } from "lucide-react";
import { ScaleIcon, LeafIcon, FlameIcon, VisionIcon, MissionIcon, ValuesIcon } from "@/components/Icons";
import heroImage from "@/assets/pump-jacks.jpg";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { InteractiveTimeline } from "@/components/about/InteractiveTimeline";
import { useRef } from "react";


const AboutPage = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <div className="min-h-screen bg-midnight overflow-hidden relative">
      <Navigation />

      {/* FLUID BACKGROUND - Premium 2025 (No external dependencies) */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#020410]" />
        {/* CSS-based noise pattern */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc=')] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[150px] animate-blob mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[150px] animate-blob animation-delay-4000 mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Cinematic Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        <motion.div style={{ scale }} className="absolute inset-0 z-0 opacity-50">
          <img
            src={heroImage}
            alt="Oil field operations"
            className="w-full h-full object-cover grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-midnight via-transparent to-midnight" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100px" }}
            transition={{ duration: 1 }}
            className="w-1 bg-gradient-to-b from-primary to-transparent mx-auto mb-8 relative"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.8)]" />
          </motion.div>

          <h1 className="text-6xl sm:text-7xl md:text-9xl font-black text-white mb-6 uppercase tracking-tighter drop-shadow-[0_0_50px_rgba(0,0,0,1)]">
            <TextDecode text="Legacy of" /> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-200 to-accent animate-gradient-x">
              Excellence
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Decades of defining the <span className="text-primary font-medium">energy frontier</span> through sustainable innovation and unwavering integrity.
          </motion.p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="text-white/50 w-8 h-8" />
        </div>
      </section>

      {/* Values Grid - Premium 3D Glassmorphism */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 translate-y-[-100px]">
            <ValueCard3D
              icon={VisionIcon}
              title="Vision"
              desc="To be the premier independent energy powerhouse, setting global benchmarks for operational mastery."
              delay={0}
            />
            <ValueCard3D
              icon={MissionIcon}
              title="Mission"
              desc="We acquire and optimize high-value assets with a relentless focus on efficiency, safety, and superior returns."
              delay={0.2}
            />
            <ValueCard3D
              icon={ValuesIcon}
              title="Values"
              desc="Integrity, transparency, and environmental stewardship are the immutable laws guiding every decision we make."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Interactive Timeline Story */}
      <InteractiveTimeline />

      <Team />
      <Footer />
    </div>
  );
};

// Cyberpunk Text Decode Effect
const TextDecode = ({ text }: { text: string }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {text}
    </motion.span>
  ); // Simplifying for MVP, full decode logic is complex to inline without extra hook. Visual impact comes from font size/weight here.
};

const ValueCard3D = ({ icon: Icon, title, desc, delay }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct * 20); // Rotation intensity
      y.set(yPct * -20);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY: mouseXSpring,
        rotateX: mouseYSpring,
        transformStyle: "preserve-3d"
      }}
      className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer shadow-xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="transform translate-z-10 relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(37,99,235,0.4)]">
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-lg">{desc}</p>
      </div>
    </motion.div>
  );
};

export default AboutPage;

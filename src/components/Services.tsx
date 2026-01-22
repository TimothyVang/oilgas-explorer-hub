import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Activity, TrendingUp, BarChart3, Database, LucideIcon } from "lucide-react";

// Asset Imports
import drillImg from "@/assets/3d/drill.png";
import flameImg from "@/assets/3d/flame.png";
import structureImg from "@/assets/3d/structure.png";
import scaleImg from "@/assets/3d/scale.png";
import leafImg from "@/assets/3d/leaf.png";

// Type Definitions
interface Service {
  id: number;
  title: string;
  category: string;
  description: string;
  img: string;
  roi: string;
  cagr: string;
  capacity: string;
  tech_specs: string[];
}

interface MetricCellProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delay: number;
}

const services = [
  {
    id: 1,
    title: "Exploration",
    category: "Upstream",
    description: "AI-Driven Geological Modeling",
    img: drillImg,
    roi: "18%",
    cagr: "12.5%",
    capacity: "45k bpd",
    tech_specs: ["Seismic Neural Nets", "3D Subsurface Vis", "Auto-Drilling"]
  },
  {
    id: 2,
    title: "EOR Tech",
    category: "Reservoir Ops",
    description: "Enhanced Recovery Systems",
    img: flameImg,
    roi: "22%",
    cagr: "15.0%",
    capacity: "+40% Yield",
    tech_specs: ["CO2 Injection", "Thermal Recovery", "Pressure Maint"]
  },
  {
    id: 3,
    title: "Facilities",
    category: "Midstream",
    description: "Automated Processing Plants",
    img: structureImg,
    roi: "14%",
    cagr: "9.2%",
    capacity: "120M scfd",
    tech_specs: ["SCADA Integration", "Smart Metering", "Remote Ops"]
  },
  {
    id: 4,
    title: "Legal & Land",
    category: "Compliance",
    description: "Regulatory Navigation",
    img: scaleImg,
    roi: "N/A",
    cagr: "Stable",
    capacity: "100% Comp",
    tech_specs: ["Digital Title", "Auto-Compliance", "Risk AI"]
  },
  {
    id: 5,
    title: "Sustainability",
    category: "Environment",
    description: "Carbon Capture Integration",
    img: leafImg,
    roi: "Long-term",
    cagr: "25%",
    capacity: "-1.5MT CO2",
    tech_specs: ["Direct Air Capture", "Bio-Sequestration", "Green H2"]
  },
];

const Services = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: targetRef,
    offset: ["start start", "end end"]
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-95%"]);
  
  // Parallax for background text - moves slower
  const bgTextY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgTextOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.03, 0.05, 0.02]);

  return (
    <section id="services" ref={targetRef} className="relative h-[300vh] bg-midnight overflow-hidden -mb-[100vh]">
      {/* Data Stream Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <DataStreamBackground />
      </div>

      <div className="sticky top-0 h-screen flex items-center overflow-hidden z-10">

        {/* Background Typography with Parallax */}
        <motion.div 
          style={{ y: bgTextY, opacity: bgTextOpacity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none"
        >
          <h1 className="text-[20vw] font-bold uppercase leading-none text-white">
            Systems
          </h1>
        </motion.div>

        <motion.div style={{ x }} className="flex gap-8 pl-[5vw] pr-[10vw]">
          {/* Intro Card */}
          <div className="w-[40vw] md:w-[25vw] flex-shrink-0 flex flex-col justify-center">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Operational <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Intelligence
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-sm font-light">
              High-yield asset optimization powered by next-gen infrastructure.
            </p>
          </div>

          {/* 3D Cards */}
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const ServiceCard = ({ service }: { service: Service }) => {
  return (
    <div className="relative w-[80vw] md:w-[45vw] lg:w-[35vw] h-[60vh] flex-shrink-0 group cursor-pointer perspective-1000">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden transition-all duration-500 group-hover:bg-white/10 group-hover:border-primary/50 group-hover:shadow-[0_0_50px_rgba(0,255,255,0.15)]">

        {/* Holographic Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Tech Specs Overlay (Revealed on Hover) */}
        <div className="absolute top-8 right-8 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex flex-col items-end space-y-2">
          {service.tech_specs.map((spec: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-primary font-mono uppercase tracking-wider">{spec}</span>
              <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
            </div>
          ))}
        </div>

        {/* Image Container with Schematic Effect */}
        <div className="h-[55%] w-full flex items-center justify-center p-10 relative z-10 font-mono text-xs text-primary/30">
          {/* Schematic Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[60%] h-[60%] border border-dashed border-primary/20 rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-[75%] h-[75%] border border-primary/10 rounded-full animate-reverse-spin opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
          </div>

          <motion.img
            src={service.img}
            loading="lazy"
            decoding="async"
            alt={service.title}
            className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(0,102,255,0.3)] group-hover:scale-110 group-hover:drop-shadow-[0_0_50px_rgba(0,255,255,0.6)] transition-all duration-700 relative z-20"
          />
        </div>

        {/* Content Core */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 bg-gradient-to-t from-midnight via-midnight/95 to-transparent min-h-[45%] flex flex-col justify-end">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-sm font-bold uppercase tracking-widest block">{service.category}</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">{service.title}</h3>
              <p className="text-gray-400 font-light">{service.description}</p>
            </div>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300 group-hover:rotate-45 bg-white/5">
              <ArrowUpRight className="text-white" />
            </div>
          </div>

          {/* Investor Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 opacity-80 group-hover:opacity-100 transition-opacity relative z-20">
            <MetricCell label="Proj ROI" value={service.roi} icon={TrendingUp} delay={0.1} />
            <MetricCell label="Growth (CAGR)" value={service.cagr} icon={Activity} delay={0.2} />
            <MetricCell label="Capacity" value={service.capacity} icon={Database} delay={0.3} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCell = ({ label, value, icon: Icon, delay }: MetricCellProps) => (
  <div className="group/metric">
    <div className="flex items-center gap-1 mb-1 text-gray-500 group-hover/metric:text-primary transition-colors">
      <Icon size={12} />
      <span className="text-xs uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-lg font-bold text-white group-hover/metric:text-white transition-colors">{value}</p>
  </div>
);

// Simple vertical raining code effect
const DataStreamBackground = () => {
  return (
    <div className="flex justify-between px-10 w-full h-full overflow-hidden opacity-20">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent h-[150vh] animate-data-rain opacity-30"
          style={{
            animationDuration: `${Math.random() * 5 + 3}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
};

export default Services;

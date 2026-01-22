import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Activity, TrendingUp, Database, LucideIcon } from "lucide-react";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      mass: 1,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 20,
    },
  },
};

const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="services" ref={sectionRef} className="py-24 bg-midnight overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <motion.h2 
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            variants={headerVariants}
          >
            Operational{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Intelligence
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto font-light"
            variants={headerVariants}
          >
            High-yield asset optimization powered by next-gen infrastructure.
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
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
    <motion.div 
      className="relative h-[500px] group cursor-pointer"
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 group-hover:bg-white/10 group-hover:border-primary/50 group-hover:shadow-[0_0_50px_rgba(197,169,98,0.15)]">

        {/* Holographic Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Tech Specs Overlay (Revealed on Hover) */}
        <div className="absolute top-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex flex-col items-end space-y-2">
          {service.tech_specs.map((spec: string, idx: number) => (
            <motion.div 
              key={idx} 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <span className="text-xs text-primary font-mono uppercase tracking-wider">{spec}</span>
              <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
            </motion.div>
          ))}
        </div>

        {/* Image Container */}
        <div className="h-[55%] w-full flex items-center justify-center p-4 relative z-10">
          {/* Ambient glow behind image */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-3/4 bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-2xl" />
          </div>
          
          <motion.img
            src={service.img}
            loading="lazy"
            decoding="async"
            alt={service.title}
            className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(197,169,98,0.4)]"
            style={{
              maskImage: 'radial-gradient(ellipse 70% 70% at center, black 50%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at center, black 50%, transparent 85%)',
            }}
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 1, 0, -1, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ 
              scale: 1.15,
              y: -12,
              transition: { duration: 0.4, ease: "easeOut" }
            }}
          />
        </div>

        {/* Content Core */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-midnight via-midnight/95 to-transparent min-h-[50%] flex flex-col justify-end">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-xs font-bold uppercase tracking-widest">{service.category}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">{service.title}</h3>
              <p className="text-muted-foreground text-sm font-light">{service.description}</p>
            </div>
            <motion.div 
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 flex-shrink-0"
              whileHover={{ 
                rotate: 45, 
                backgroundColor: "hsl(var(--primary))",
                borderColor: "hsl(var(--primary))"
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight className="text-white w-4 h-4" />
            </motion.div>
          </div>

          {/* Investor Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 opacity-80 group-hover:opacity-100 transition-opacity">
            <MetricCell label="Proj ROI" value={service.roi} icon={TrendingUp} />
            <MetricCell label="CAGR" value={service.cagr} icon={Activity} />
            <MetricCell label="Capacity" value={service.capacity} icon={Database} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MetricCell = ({ label, value, icon: Icon }: MetricCellProps) => (
  <div className="group/metric">
    <div className="flex items-center gap-1 mb-1 text-muted-foreground group-hover/metric:text-primary transition-colors">
      <Icon size={10} />
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-white">{value}</p>
  </div>
);

export default Services;

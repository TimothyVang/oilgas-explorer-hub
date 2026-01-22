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

const Services = () => {
  return (
    <section id="services" className="py-24 bg-midnight overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Operational{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Intelligence
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            High-yield asset optimization powered by next-gen infrastructure.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ service }: { service: Service }) => {
  return (
    <div className="relative h-[500px] group cursor-pointer">
      <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 group-hover:bg-white/10 group-hover:border-primary/50 group-hover:shadow-[0_0_50px_rgba(197,169,98,0.15)]">

        {/* Holographic Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Tech Specs Overlay (Revealed on Hover) */}
        <div className="absolute top-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex flex-col items-end space-y-2">
          {service.tech_specs.map((spec: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-primary font-mono uppercase tracking-wider">{spec}</span>
              <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
            </div>
          ))}
        </div>

        {/* Image Container */}
        <div className="h-[50%] w-full flex items-center justify-center p-8 relative z-10">
          <img
            src={service.img}
            loading="lazy"
            decoding="async"
            alt={service.title}
            className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(197,169,98,0.3)] group-hover:scale-110 transition-transform duration-700"
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
              <p className="text-gray-400 text-sm font-light">{service.description}</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300 group-hover:rotate-45 bg-white/5 flex-shrink-0">
              <ArrowUpRight className="text-white w-4 h-4" />
            </div>
          </div>

          {/* Investor Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 opacity-80 group-hover:opacity-100 transition-opacity">
            <MetricCell label="Proj ROI" value={service.roi} icon={TrendingUp} />
            <MetricCell label="CAGR" value={service.cagr} icon={Activity} />
            <MetricCell label="Capacity" value={service.capacity} icon={Database} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCell = ({ label, value, icon: Icon }: MetricCellProps) => (
  <div className="group/metric">
    <div className="flex items-center gap-1 mb-1 text-gray-500 group-hover/metric:text-primary transition-colors">
      <Icon size={10} />
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-white">{value}</p>
  </div>
);

export default Services;

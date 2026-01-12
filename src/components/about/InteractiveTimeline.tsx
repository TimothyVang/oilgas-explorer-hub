import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Milestone {
  year: string;
  title: string;
  description: string;
  side: "left" | "right";
}

const milestones = [
    {
        year: "1995",
        title: "The Genesis",
        description: "BAH Energy originates in the Permian Basin with a single, ambitious rig and a vision to modernize extraction.",
        side: "left"
    },
    {
        year: "2005",
        title: "Strategic Expansion",
        description: "Acquisition of major assets in North Dakota marks the beginning of our nationwide footprint, tripling production capacity.",
        side: "right"
    },
    {
        year: "2015",
        title: "The AI Revolution",
        description: "Implementation of proprietary geological neural networks redefines efficiency, predicting reserves with 94% accuracy.",
        side: "left"
    },
    {
        year: "2024",
        title: "Carbon Neutral Protocol",
        description: "Launching industry-leading carbon capture initiatives across all facilities, setting a new standard for sustainable energy.",
        side: "right"
    }
];

export const InteractiveTimeline = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <section ref={containerRef} className="py-32 relative overflow-hidden">
            {/* Background Texture for Context */}
            <div className="absolute inset-0 bg-midnight opacity-50" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-primary font-mono text-sm uppercase tracking-[0.2em] mb-4 block">Our Journey</span>
                        <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
                            Timeline of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Evolution</span>
                        </h2>
                    </motion.div>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Central Glowing Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-white/5 -translate-x-1/2" />
                    <motion.div
                        style={{ scaleY, originY: 0 }}
                        className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-blue-400 to-primary -translate-x-1/2 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                    />

                    <div className="space-y-24">
                        {milestones.map((item, index) => (
                            <TimelineItem key={index} item={item} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const TimelineItem = ({ item, index }: { item: Milestone, index: number }) => {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
        >
            {/* Content Card */}
            <div className={`flex-1 w-full ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} pl-12 md:pl-0`}>
                <div className="group relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                    <h3 className="text-6xl md:text-8xl font-black text-white/5 absolute -top-10 md:-top-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 select-none pointer-events-none w-full">
                        {item.year}
                    </h3>

                    <div className="relative z-10">
                        <span className="text-primary font-bold text-xl mb-2 block">{item.year}</span>
                        <h4 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{item.title}</h4>
                        <p className="text-gray-400 leading-relaxed text-lg">{item.description}</p>
                    </div>
                </div>
            </div>

            {/* Central Node */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-midnight border-2 border-primary rounded-full z-20">
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
            </div>

            {/* Spacer for opposite side */}
            <div className="flex-1 hidden md:block" />
        </motion.div>
    );
};

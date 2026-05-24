import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Milestone {
  year: string;
  title: string;
  description: string;
  side: "left" | "right";
}

const milestones: Milestone[] = [
    {
        year: "01",
        title: "Review the Asset",
        description: "BAH starts with the oil and gas asset, available records, field context, and technical questions.",
        side: "left"
    },
    {
        year: "02",
        title: "Build the File",
        description: "Technical, financial, mapping, operating, and media materials are organized for private review.",
        side: "right"
    },
    {
        year: "03",
        title: "Approve Investor Access",
        description: "BAH controls which investors receive access and which files are assigned to each account.",
        side: "left"
    },
    {
        year: "04",
        title: "Support the Review",
        description: "Approved investors use the portal to review the materials BAH has prepared and released.",
        side: "right"
    }
];

export const InteractiveTimeline = () => {
    const isMobile = useIsMobile();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Disable scroll-driven animation on mobile
    const scaleY = useTransform(scrollYProgress, [0, 1], isMobile ? [1, 1] : [0, 1]);

    return (
        <section ref={containerRef} className="relative overflow-hidden border-y-2 border-primary bg-secondary py-32 text-white">

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="kinetic-label mb-4 block text-sm text-primary">Access Flow</span>
                        <h2 className="kinetic-heading text-6xl text-white md:text-8xl">
                            Investor Review Path
                        </h2>
                    </motion.div>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    <div className="absolute bottom-0 left-4 top-0 w-1 -translate-x-1/2 bg-white/20 md:left-1/2" />
                    <motion.div
                        style={{ scaleY, originY: 0 }}
                        className="absolute bottom-0 left-4 top-0 w-1 -translate-x-1/2 bg-primary md:left-1/2"
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
                    <h3 className="kinetic-heading pointer-events-none absolute -top-10 w-full select-none text-6xl text-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:-top-16 md:text-8xl">
                        {item.year}
                    </h3>

                    <div className="relative z-10">
                        <span className="kinetic-label mb-2 block text-sm text-primary">{item.year}</span>
                        <h4 className="kinetic-heading mb-4 text-3xl text-white transition-transform group-hover:translate-x-4 md:text-5xl">{item.title}</h4>
                        <p className="text-lg leading-relaxed text-white/65">{item.description}</p>
                    </div>
                </div>
            </div>

            {/* Central Node - ping animation disabled on mobile */}
            <div className="absolute left-4 z-20 h-4 w-4 -translate-x-1/2 border-2 border-primary bg-secondary md:left-1/2">
                <div className="absolute inset-0 bg-primary opacity-30" />
            </div>

            {/* Spacer for opposite side */}
            <div className="flex-1 hidden md:block" />
        </motion.div>
    );
};

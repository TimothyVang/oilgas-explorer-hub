import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HolographicCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const HolographicCard = ({ children, className, delay = 0 }: HolographicCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={cn(
                "relative group",
                "bg-midnight/30 backdrop-blur-xl",
                "border border-white/10 rounded-2xl",
                "overflow-hidden",
                "transition-all duration-500",
                "hover:border-primary/50 hover:bg-midnight/40 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]",
                className
            )}
        >
            {/* Glossy sheen overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Corner accents meant to look like HUD markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50 rounded-tl-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50 rounded-tr-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50 rounded-bl-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50 rounded-br-md opacity-50 group-hover:opacity-100 transition-opacity" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HolographicCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    variant?: "default" | "elevated" | "subtle";
}

export const HolographicCard = ({ children, className, delay = 0, variant = "default" }: HolographicCardProps) => {
    const variants = {
        default: "bg-[#08263F] border-white/20 hover:bg-secondary",
        elevated: "bg-secondary border-primary hover:bg-[#08263F]",
        subtle: "bg-[#08263F] border-white/10 hover:bg-secondary"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "relative group",
                "border-2 rounded-none",
                "overflow-hidden",
                "transition-all duration-300 ease-out",
                variants[variant],
                className
            )}
        >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

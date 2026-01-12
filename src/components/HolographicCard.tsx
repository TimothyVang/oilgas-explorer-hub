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
        default: "bg-white/5 border-white/10 hover:border-white/20",
        elevated: "bg-white/[0.07] border-white/10 hover:border-primary/30",
        subtle: "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "relative group",
                "backdrop-blur-md",
                "border rounded-3xl",
                "overflow-hidden",
                "transition-all duration-500 ease-out",
                variants[variant],
                "hover:shadow-[0_0_40px_rgba(0,102,255,0.15)]",
                className
            )}
        >
            {/* Subtle grid on hover - matches homepage Services cards */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Top highlight - subtle accent */}
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

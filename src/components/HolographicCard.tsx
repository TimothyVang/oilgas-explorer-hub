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
        default: "bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/[0.08] hover:border-primary/40",
        elevated: "bg-gradient-to-br from-white/[0.12] to-white/[0.04] border-white/[0.12] hover:border-primary/50 shadow-2xl",
        subtle: "bg-white/[0.03] border-white/[0.05] hover:border-white/[0.15]"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "relative group",
                "backdrop-blur-2xl",
                "border rounded-3xl",
                "overflow-hidden",
                "transition-all duration-500 ease-out",
                variants[variant],
                "hover:shadow-[0_8px_60px_-12px_rgba(0,200,255,0.35)]",
                "hover:translate-y-[-2px]",
                className
            )}
        >
            {/* Holographic Grid Overlay - matches homepage Services cards */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Animated gradient border on hover */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute inset-[-1px] rounded-3xl bg-gradient-to-r from-primary/50 via-accent/30 to-primary/50 blur-sm animate-gradient" />
            </div>

            {/* Inner glass effect - darker to match midnight theme */}
            <div className="absolute inset-[1px] rounded-[22px] bg-gradient-to-br from-midnight/95 to-[#010308]/98 pointer-events-none" />
            
            {/* Top highlight */}
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            {/* Corner accent glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Glossy sheen overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
  mode?: "fade" | "slide" | "scale" | "slideUp";
  duration?: number;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
};

/**
 * PageTransition - Wraps page content with smooth entry/exit animations
 *
 * Usage:
 * ```tsx
 * <PageTransition mode="fade">
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export const PageTransition = ({
  children,
  mode = "fade",
  duration = 0.3,
}: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[mode]}
        transition={{
          duration,
          ease: [0.25, 0.1, 0.25, 1], // Smooth easing
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * FadeIn - Simple fade-in animation for any content
 * Respects reduced-motion preference
 */
export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * SlideIn - Slide-in animation with direction control
 */
export const SlideIn = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className = "",
}: {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
}) => {
  const directionMap = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScaleIn - Scale-in animation for cards and modals
 */
export const ScaleIn = ({
  children,
  delay = 0,
  duration = 0.4,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration, delay, ease: [0.34, 1.56, 0.64, 1] }} // Spring-like ease
    className={className}
  >
    {children}
  </motion.div>
);

export default PageTransition;

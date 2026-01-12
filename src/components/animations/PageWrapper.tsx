import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageWrapper - Provides smooth page entry animations
 *
 * Simply wrap your page content with this component for
 * a consistent, subtle entry animation.
 *
 * Usage:
 * ```tsx
 * const MyPage = () => (
 *   <PageWrapper>
 *     <div>Your page content</div>
 *   </PageWrapper>
 * );
 * ```
 */
export const PageWrapper = ({ children, className = "" }: PageWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smooth feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * CardWrapper - Provides smooth card entry animation with scale effect
 */
export const CardWrapper = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggeredList - Animates list items with staggered timing
 */
export const StaggeredList = ({
  children,
  staggerDelay = 0.05,
  className = "",
}: {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PageWrapper;

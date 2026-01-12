import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedListProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * AnimatedList - Renders children with staggered animation
 *
 * Usage:
 * ```tsx
 * <AnimatedList>
 *   {items.map(item => <Card key={item.id}>{item.name}</Card>)}
 * </AnimatedList>
 * ```
 */
export const AnimatedList = ({
  children,
  staggerDelay = 0.1,
  className = "",
}: AnimatedListProps) => {
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
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * AnimatedListItem - Individual animated item for custom layouts
 *
 * Usage:
 * ```tsx
 * {items.map((item, index) => (
 *   <AnimatedListItem key={item.id} index={index}>
 *     <Card>{item.name}</Card>
 *   </AnimatedListItem>
 * ))}
 * ```
 */
export const AnimatedListItem = ({
  children,
  index = 0,
  delay = 0.05,
}: {
  children: ReactNode;
  index?: number;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.4,
      delay: index * delay,
      ease: [0.25, 0.1, 0.25, 1],
    }}
  >
    {children}
  </motion.div>
);

interface AnimatedGridProps {
  children: ReactNode[];
  columns?: number;
  gap?: string;
  staggerDelay?: number;
  className?: string;
}

/**
 * AnimatedGrid - Grid layout with staggered animations
 *
 * Usage:
 * ```tsx
 * <AnimatedGrid columns={3} gap="4">
 *   {items.map(item => <Card key={item.id}>{item.name}</Card>)}
 * </AnimatedGrid>
 * ```
 */
export const AnimatedGrid = ({
  children,
  columns = 3,
  gap = "6",
  staggerDelay = 0.08,
  className = "",
}: AnimatedGridProps) => {
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
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-${gap} ${className}`}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, scale: 0.9, y: 20 },
            visible: { opacity: 1, scale: 1, y: 0 },
          }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * AnimatedTable - Table rows with staggered animations
 *
 * Wrap your table rows with this component for animated entry
 */
export const AnimatedTableRow = ({
  children,
  index = 0,
  delay = 0.03,
}: {
  children: ReactNode;
  index?: number;
  delay?: number;
}) => (
  <motion.tr
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: 0.3,
      delay: index * delay,
      ease: "easeOut",
    }}
  >
    {children}
  </motion.tr>
);

export default AnimatedList;

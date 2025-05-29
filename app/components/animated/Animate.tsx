import React, { ReactNode } from "react";
import { motion, AnimatePresence, MotionProps, Variants } from "motion/react";

interface AnimateProps extends MotionProps {
  children: ReactNode;
  variants: Variants;
  initial?: string;
  animate?: string;
  duration?: number;
  delay?: number;
  isLoading?: boolean;
  loader?: ReactNode;
}

export const Animate: React.FC<AnimateProps> = ({
  children,
  variants,
  initial = "hidden",
  animate = "visible",
  duration = 0.5,
  delay = 0,
  isLoading = false,
  loader = <DefaultLoader />,
  ...rest
}) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          transition={{ duration, delay }}
          {...rest}
        >
          {loader}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={initial}
          animate={animate}
          exit="hidden"
          variants={variants}
          transition={{ duration, delay }}
          {...rest}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DefaultLoader = () => (
  <div className="p-4 animate-pulse space-y-2">
    <div className="h-6 bg-gray-300 rounded w-3/4" />
    <div className="h-6 bg-gray-300 rounded w-1/2" />
  </div>
);

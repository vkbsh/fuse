import { ReactNode } from "react";
import { motion, MotionProps } from "motion/react";

import { variants, Variant } from "./variants";

type AnimateProps = MotionProps & {
  variant: Variant;
  className?: string;
  children: ReactNode;
};

export default function Animate({
  className,
  children,
  variant,
  ...rest
}: AnimateProps) {
  return (
    <motion.div
      exit="exit"
      initial="hidden"
      animate="visible"
      className={className}
      variants={variants[variant]}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

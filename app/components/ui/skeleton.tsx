import { motion } from "motion/react";

import { cn } from "~/lib/utils";
import motionProps from "~/lib/motion";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={cn("bg-placeholder/50", className)}
      {...motionProps.skeleton}
      {...props}
    />
  );
}

export { Skeleton };

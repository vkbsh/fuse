import { motion } from "motion/react";

import { cn } from "~/lib/utils";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  // TODO: Animate pulse
  return (
    <motion.div className={cn("bg-accent rounded-md", className)} {...props} />
  );
}

export { Skeleton };

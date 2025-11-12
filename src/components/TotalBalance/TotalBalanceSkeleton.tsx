import { motion } from "motion/react";

import motionProps from "~/lib/motion";
import Skeleton from "~/components/ui/skeleton";

export default function TotalBalanceSkeleton() {
  return (
    <motion.div
      className="flex flex-row gap-1 h-16 pt-4"
      {...motionProps.global.fadeIn}
    >
      <Skeleton className="w-6 h-[36px] flex shrink-0" />
      <Skeleton className="w-36 h-[36px] flex shrink-0" />
    </motion.div>
  );
}

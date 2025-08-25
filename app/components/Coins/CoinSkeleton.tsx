import { motion } from "motion/react";

import motionProps from "~/lib/motion";
import { Skeleton } from "~/components/ui/skeleton";

export default function CoinSkeleton() {
  return (
    <motion.div
      className="flex flex-row gap-4 h-16 p-3"
      {...motionProps.fadeIn}
    >
      <Skeleton className="w-[42px] h-[42px] rounded-full flex shrink-0" />
      <div className="flex flex-col gap-2.5 justify-center w-full">
        <Skeleton className="h-3 w-12" />
        <div className="flex flex-row gap-1">
          <Skeleton className="h-3 w-20" />
          <div className="flex flex-row gap-10 ml-auto">
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

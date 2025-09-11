import { motion } from "framer-motion";

import motionProps from "~/lib/motion";
import Skeleton from "~/components/ui/skeleton";

export default function TransactionSkeleton() {
  return (
    <motion.div
      className="flex flex-row gap-4 h-16 p-3"
      {...motionProps.global.fadeIn}
    >
      <Skeleton className="w-[42px] h-[42px] rounded-xl flex shrink-0" />
      <div className="flex flex-col gap-2.5 justify-center w-full">
        <Skeleton className="h-3 w-12" />
        <div className="flex flex-row gap-1">
          <Skeleton className="h-3 w-20" />
          <div className="flex flex-row gap-10 ml-auto">
            <div className="flex flex-row gap-2">
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-18" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";

import motionProps from "~/lib/motion";
import Skeleton from "~/components/ui/skeleton";

export default function TransactionSkeleton() {
  return (
    <motion.div
      className="flex flex-row gap-4 h-16 p-3"
      {...motionProps.global.fadeIn}
    >
      <Skeleton className="w-[42px] h-[42px] flex shrink-0 rounded-4xl" />
      <div className="flex flex-col gap-2.5 justify-center w-full">
        <Skeleton className="h-3 w-12 rounded-md" />
        <div className="flex flex-row gap-1">
          <Skeleton className="h-3 w-20 rounded-md" />
          <div className="flex flex-row gap-10 ml-auto">
            <div className="flex flex-row gap-2">
              <Skeleton className="h-3 w-4 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="h-3 w-18 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

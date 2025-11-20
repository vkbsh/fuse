import { motion } from "motion/react";

import motionProps from "~/lib/motion";

export default function TotalBalanceSkeleton() {
  return (
    <motion.span
      className="text-[52px] font-bold -mt-2"
      {...motionProps.global.totalAmountSkeleton}
    >
      $XXXX
    </motion.span>
  );
}

import { motion } from "motion/react";

import motionProps from "~/lib/motion";

export default function TotalBalanceSkeleton() {
  return (
    <motion.span
      className="text-[52px] font-bold -mt-2"
      initial={{ opacity: 0, filter: "blur(7px)" }}
      exit={{ opacity: 0, filter: "blur(7px)" }}
      animate={{ opacity: [0.5, 0.7], filter: "blur(7px)" }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
    >
      $XXXX
    </motion.span>
  );
}

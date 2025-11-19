import { motion } from "motion/react";

import motionProps from "~/lib/motion";

export default function TotalBalanceSkeleton() {
  return (
    <motion.span
      className="text-[45px] h-16 font-bold"
      initial={{ opacity: 0, filter: "blur(6px)" }}
      exit={{ opacity: 0, filter: "blur(6px)" }}
      animate={{ opacity: [0.5, 0.8], filter: "blur(6px)" }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
    >
      $0.00
    </motion.span>
  );
}

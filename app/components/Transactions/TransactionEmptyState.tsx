import { motion } from "motion/react";

import motionProps from "~/lib/motion";

export default function TransactionEmptyState() {
  return (
    <motion.div
      key="transaction-empty-state"
      className="flex flex-col justify-center items-center"
      {...motionProps.fadeIn}
    >
      <img
        alt="No transactions yet"
        src="/empty-transaction-placeholder.svg"
        className="w-[274px] h-[142px]"
      />
      <span className="text-lg">No transactions yet</span>
    </motion.div>
  );
}

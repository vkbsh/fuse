import { motion } from "motion/react";

import motionProps from "~/lib/motion";

export default function EmptyState({ label }: { label: string }) {
  return (
    <motion.div
      key="transaction-empty-state"
      className="flex flex-col justify-center items-center"
      {...motionProps.global.fadeIn}
    >
      <img
        alt="No transactions yet"
        src="/tx-placeholder.svg"
        className="w-[274px] h-[142px]"
      />
      <span className="text-lg">{label}</span>
    </motion.div>
  );
}

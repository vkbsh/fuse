import { type Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import motionProps from "~/lib/motion";
import { formatUSD } from "~/lib/amount";
import { useTokenInfo } from "~/hooks/resources";

export default function TotalBalance({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  const { totalAmount } = useTokenInfo(vaultAddress);

  return (
    <section className="w-auto flex flex-col">
      <span className="font-medium text-sm text-placeholder">Balance</span>
      <div className="flex flex-row text-[45px] font-bold">
        <AnimatePresence initial={false}>
          <motion.span {...motionProps.global.numbers}>
            {formatUSD(totalAmount)}
          </motion.span>
        </AnimatePresence>
      </div>
    </section>
  );
}

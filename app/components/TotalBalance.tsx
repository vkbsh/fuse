import { Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import { roundCoin } from "~/lib/amount";
import { useTokenInfo } from "~/hooks/resources";

export default function TotalBalance({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  const { totalAmount } = useTokenInfo(vaultAddress);
  const roundedAmount = roundCoin("usd", totalAmount) + "";

  return (
    <section className="w-auto flex flex-col">
      <span className="font-medium text-sm">Total Balance</span>
      <div className="flex flex-row text-[45px] font-bold">
        <span>$</span>
        <motion.span
          key={roundedAmount}
          transition={{ duration: 0.6 }}
          initial={{ filter: "blur(6px)" }}
          animate={{ filter: "blur(0px)" }}
          exit={{ filter: "blur(6px)" }}
        >
          {roundedAmount}
        </motion.span>
      </div>
    </section>
  );
}

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
      <span className="font-medium text-sm">Balance</span>
      <div className="flex flex-row text-[45px] font-bold">
        <span>$</span>
        <AnimatePresence>
          {totalAmount ? (
            <motion.div>
              <span>{roundedAmount}</span>
            </motion.div>
          ) : (
            <motion.div>--.--</motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

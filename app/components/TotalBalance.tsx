import { Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import { roundCoin } from "~/lib/amount";
import { useTokenInfo } from "~/hooks/resources";

export default function TotalBalance({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  return (
    <section className="w-auto flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      <Balance vaultAddress={vaultAddress} />
    </section>
  );
}

function Balance({ vaultAddress }: { vaultAddress: Address }) {
  const { totalAmount } = useTokenInfo(vaultAddress);
  const roundedAmount = roundCoin("usd", totalAmount) + "";

  return (
    <div className="flex flex-row text-[45px] font-bold">
      <span>$</span>
      <AnimatePresence>
        {totalAmount ? (
          <motion.div>
            <span>{roundedAmount}</span>
          </motion.div>
        ) : (
          <motion.div className="opacity-40 blur-xs">--.--</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

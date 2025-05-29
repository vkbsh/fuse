import { motion, AnimatePresence } from "motion/react";

import { useTokenInfo } from "~/hooks/resources";

import { Address } from "~/model/web3js";
import { roundCoin } from "~/utils/amount";

export default function BalanceComponent({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  return (
    <section className="flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      <AnimatePresence>
        {vaultAddress && <TotalBalance vaultAddress={vaultAddress} />}
      </AnimatePresence>
    </section>
  );
}

function TotalBalance({ vaultAddress }: { vaultAddress: Address }) {
  const { totalAmount } = useTokenInfo(vaultAddress);
  const roundedAmount = roundCoin("usd", totalAmount);
  const roundedAmounArray = roundedAmount.toString().split("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex text-[45px] font-bold"
    >
      <span>$</span>
      <AnimatePresence>
        {roundedAmounArray.map((num, i) => (
          <span key={i} className="flex justify-center items-center">
            <motion.span
              key={i + num}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
            >
              {num}
            </motion.span>
          </span>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

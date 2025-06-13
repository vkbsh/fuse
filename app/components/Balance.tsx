import { Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import { useTokenInfo } from "~/hooks/resources";
import { roundCoin } from "~/utils/amount";

export default function BalanceComponent({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  return (
    <section className="w-auto flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      {vaultAddress && <TotalBalance vaultAddress={vaultAddress} />}
    </section>
  );
}

function TotalBalance({ vaultAddress }: { vaultAddress: Address }) {
  const { totalAmount, isLoading, isError } = useTokenInfo(vaultAddress);

  const isLoadingOrError = isLoading || isError;
  const roundedAmount = totalAmount ? roundCoin("usd", totalAmount) : "0.00";
  const roundedAmounArray = String(roundedAmount).split("");

  return (
    <div className="text-[45px] font-bold">
      <span>$</span>
      <AnimatePresence mode="popLayout">
        {roundedAmounArray.map((num, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: -10 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative inline-block"
            animate={{ opacity: isLoadingOrError ? [0.2, 1, 0.2] : 1, y: 0 }}
            transition={{
              opacity: {
                duration: isLoadingOrError ? 2 : 0.4,
                repeat: isLoadingOrError ? Infinity : 0,
                delay: isLoadingOrError ? 0 : i * 0.04,
              },
              y: {
                duration: 0.4,
                delay: i * 0.04,
              },
            }}
          >
            {num}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

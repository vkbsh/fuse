import { type Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import motionProps from "~/lib/motion";
import { formatUSD } from "~/lib/amount";

import { useEarnBalance, useTokenInfo } from "~/hooks/resources";

import TotalBalanceSkeleton from "./TotalBalanceSkeleton";

export default function TotalBalance({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  const earnBalance = useEarnBalance(vaultAddress);
  const { totalAmount } = useTokenInfo(vaultAddress);

  const earnTotalAmount =
    !earnBalance.isLoading && earnBalance.data.length
      ? earnBalance.data.reduce((acc, b) => acc + (b?.usdAmount || 0), 0)
      : 0;

  const formatedAmount = formatUSD(totalAmount + earnTotalAmount);
  const baseAmount = formatedAmount.slice(0, -2);
  const cents = formatedAmount.slice(-2);
  return (
    <section className="w-auto flex flex-col">
      <span className="font-medium text-sm text-placeholder">
        Total Balance
      </span>
      <div className="flex flex-row text-[45px] h-16 font-bold">
        <AnimatePresence initial={false}>
          {earnBalance.isLoading ? (
            <TotalBalanceSkeleton />
          ) : (
            <motion.div {...motionProps.global.numbers}>
              <span>{baseAmount}</span>
              <span className="text-placeholder">{cents}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

import { Address } from "gill";
import { motion } from "motion/react";

import motionProps from "~/lib/motion";
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
      <span className="font-medium text-sm text-placeholder">
        Total Balance
      </span>
      <div className="flex flex-row text-[45px] font-bold">
        <span>$</span>
        <motion.span key={roundedAmount} {...motionProps.numbers}>
          {roundedAmount}
        </motion.span>
      </div>
    </section>
  );
}

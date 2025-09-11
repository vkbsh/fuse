import { type Address } from "gill";
import { useDebounce } from "@uidotdev/usehooks";
import { motion, AnimatePresence } from "motion/react";

import motionProps from "~/lib/motion";
import { formatUSD, roundToken } from "~/lib/amount";
import { useTokenPrice } from "~/hooks/resources";

export default function PriceToken({
  mint,
  amount,
  maxAmount,
}: {
  mint: Address | undefined;
  amount: number;
  maxAmount: number;
}) {
  const { data: price } = useTokenPrice(mint) || {};
  const priceLabel = (price || 1) * amount || 0;
  const debouncedPrice = useDebounce(priceLabel, 700);

  return (
    <div className="flex flex-row items-center justify-between text-sm">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={debouncedPrice}
          className="text-placeholder"
          {...motionProps.global.numbers}
        >
          {formatUSD(debouncedPrice)}
        </motion.span>
        <motion.span
          key={maxAmount}
          className="text-placeholder"
          {...motionProps.global.numbers}
        >
          {roundToken(maxAmount)}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

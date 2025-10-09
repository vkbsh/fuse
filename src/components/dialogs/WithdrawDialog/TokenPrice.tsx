import { memo } from "react";
import { type Address } from "gill";
import { motion } from "motion/react";
import { useDebounce } from "@uidotdev/usehooks";

import motionProps from "~/lib/motion";
import { useTokenPrice } from "~/hooks/resources";
import { formatUSD, roundToken } from "~/lib/amount";

export default function PriceToken({
  mint,
  amount,
  maxAmount,
}: {
  mint: Address | undefined;
  amount: number;
  maxAmount: number;
}) {
  const debouncedPriceLabel = useDebounce(amount, 700);

  return (
    <div className="flex flex-row items-center justify-between text-sm">
      <Price mint={mint} amount={debouncedPriceLabel} />
      <motion.span
        key={maxAmount}
        className="text-placeholder"
        {...motionProps.global.numbers}
      >
        {roundToken(maxAmount)}
      </motion.span>
    </div>
  );
}

const Price = memo(function ({
  mint,
  amount,
}: {
  mint: Address | undefined;
  amount: number;
}) {
  const { data: price } = useTokenPrice(mint) || {};
  const isNoPrice = !price;
  const priceLabel = isNoPrice ? null : Number(price) * amount;

  return (
    <motion.span
      key={priceLabel}
      className="text-placeholder"
      {...motionProps.global.numbers}
    >
      {formatUSD(priceLabel)}
    </motion.span>
  );
});

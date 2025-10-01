import { motion } from "motion/react";

import motionProps from "~/lib/motion";
import { roundToken } from "~/lib/amount";
import { type TokenData } from "~/hooks/resources";
import { formatUSD } from "~/lib/amount";

export default function Coin({ token }: { token: TokenData }) {
  const { name, symbol, icon, amount, usdAmount } = token;
  const roundedAmount = roundToken(amount);

  return (
    <div className="flex items-center justify-between gap-4 whitespace-nowrap">
      <div className="flex flex-row items-center gap-4">
        <span className="flex rounded-full">
          <img
            alt={name}
            src={icon}
            className="w-[42px] h-[42px] shrink-0 rounded-full"
          />
        </span>
        <span className="flex flex-col gap-0">
          <span className="text-left font-semibold">
            {name === "Wrapped SOL" ? "Solana" : name}
          </span>

          <motion.span
            key={roundedAmount}
            className="text-sm text-placeholder"
            {...motionProps.global.numbers}
          >
            {`${roundedAmount} ${symbol}`}
          </motion.span>
        </span>
      </div>

      <motion.span
        key={usdAmount}
        className="font-medium flex mt-auto"
        {...motionProps.global.numbers}
      >
        {usdAmount === 0 ? " -" : formatUSD(usdAmount)}
      </motion.span>
    </div>
  );
}

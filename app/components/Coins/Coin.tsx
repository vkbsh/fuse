import { motion } from "motion/react";

import motionProps from "~/lib/motion";
import { roundCoin } from "~/lib/amount";
import { TokenData } from "~/hooks/resources";

export default function Coin({ token }: { token: TokenData }) {
  const { name, symbol, logoURI, amount, usdAmount } = token;
  const roundedAmount = roundCoin("token", Number(amount)) + "";
  const roundedUsdAmount = roundCoin("usd", Number(usdAmount)) + "";

  return (
    <div className="flex items-center justify-between gap-4 whitespace-nowrap">
      <div className="flex flex-row items-center gap-4">
        <span className="flex rounded-full">
          <img
            alt={name}
            src={logoURI}
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
            {...motionProps.numbers}
          >
            {`${roundedAmount} ${symbol}`}
          </motion.span>
        </span>
      </div>

      <motion.span
        key={roundedUsdAmount}
        className="font-medium flex mt-auto"
        {...motionProps.numbers}
      >
        $ {roundedUsdAmount}
      </motion.span>
    </div>
  );
}

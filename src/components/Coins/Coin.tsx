import { address } from "gill";
import { motion } from "motion/react";

import motionProps from "~/lib/motion";
import { formatUSD } from "~/lib/amount";
import { getIconUrl } from "~/lib/utils";
import { roundToken } from "~/lib/amount";
import { abbreviateAddress } from "~/lib/address";

import { type TokenData } from "~/hooks/resources";

export default function Coin({ token }: { token: TokenData }) {
  const { name, symbol, icon, amount, usdAmount, id } = token;
  const iconUrl = getIconUrl(icon);
  const roundedAmount = amount ? roundToken(amount) : "-";

  return (
    <div className="flex items-center justify-between gap-4 whitespace-nowrap">
      <div className="flex flex-row items-center gap-4">
        <span className="flex rounded-full">
          {iconUrl ? (
            <img
              alt={name}
              src={iconUrl}
              className="w-[42px] h-[42px] shrink-0 rounded-full"
            />
          ) : (
            <span className="w-[42px] h-[42px] shrink-0 rounded-full bg-placeholder" />
          )}
        </span>
        <span className="flex flex-col gap-0">
          <span className="text-left font-semibold">
            {name === "Wrapped SOL"
              ? "Solana"
              : name || abbreviateAddress(address(id)) || "-"}
          </span>

          <motion.span
            key={roundedAmount}
            className="flex text-sm text-placeholder"
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

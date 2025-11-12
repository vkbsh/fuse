import { address } from "gill";
import { motion } from "motion/react";

import motionProps from "~/lib/motion";
import { formatUSD } from "~/lib/amount";
import { abbreviateAddress } from "~/lib/address";
import { getIconUrl, getEarnMeta } from "~/lib/utils";

import { type EarnCoin } from "~/hooks/resources";

export default function CoinEarn({ coin }: { coin: EarnCoin }) {
  const { name, icon, usdAmount, id, symbol, programId } = coin;

  const earnMeta = getEarnMeta(programId);
  const coinIconUrl = icon ? getIconUrl(icon) : null;

  return (
    <div className="flex items-center justify-between gap-4 whitespace-nowrap">
      <div className="flex flex-row items-center gap-4">
        <span className="flex rounded-full relative w-[42px] h-[42px]">
          {earnMeta.iconUrl ? (
            <img
              alt={earnMeta.name}
              src={earnMeta.iconUrl}
              className="absolute top-0 left-0 w-[42px] h-[42px] shrink-0 rounded-full"
            />
          ) : (
            <span className="absolute top-0 right-0 w-[42px] h-[42px] shrink-0 rounded-full bg-placeholder" />
          )}
          {coinIconUrl ? (
            <img
              alt={name}
              src={coinIconUrl}
              className="absolute -top-1 -right-1 w-[16px] h-[16px] shrink-0 rounded-full"
            />
          ) : (
            <span className="absolute -top-1 -right-1 w-[16px] h-[16px] shrink-0 rounded-full bg-placeholder" />
          )}
        </span>
        <span className="flex flex-col gap-0">
          <span className="text-left font-semibold">
            {name === "Wrapped SOL"
              ? "Solana"
              : name || abbreviateAddress(address(id || "")) || "-"}
          </span>

          <motion.span
            key={programId + symbol}
            className="flex text-sm text-placeholder"
            {...motionProps.global.numbers}
          >
            {earnMeta.name}
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

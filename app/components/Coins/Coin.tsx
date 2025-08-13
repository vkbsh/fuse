import { AnimatePresence, motion } from "motion/react";

import { roundCoin } from "~/lib/amount";
import { TokenData } from "~/hooks/resources";

export default function Coin({ token }: { token: TokenData }) {
  const { name, symbol, logoURI, amount, usdAmount } = token;
  const roundedAmount = roundCoin("token", Number(amount)) + "";
  const roundedUsdAmount = roundCoin("usd", Number(usdAmount)) + "";

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <div className="flex items-center justify-between rounded-2xl p-3">
        <div className="flex flex-row items-center gap-4">
          <img
            alt={name}
            src={logoURI}
            className="w-[42px] h-[42px] shrink-0 rounded-full"
          />
          <span className="flex flex-col gap-0">
            <span className="text-left font-semibold">
              {name === "Wrapped SOL" ? "Solana" : name}
            </span>

            <motion.span
              key={roundedAmount}
              transition={{ duration: 0.2 }}
              initial={{ filter: "blur(6px)" }}
              animate={{ filter: "blur(0px)" }}
              exit={{ filter: "blur(6px)" }}
              className="text-sm"
            >
              {`${roundedAmount} ${symbol}`}
            </motion.span>
          </span>
        </div>

        <motion.span
          key={roundedUsdAmount}
          transition={{ duration: 0.2 }}
          initial={{ filter: "blur(6px)" }}
          animate={{ filter: "blur(0px)" }}
          exit={{ filter: "blur(6px)" }}
          className="font-medium flex mt-auto"
        >
          $ {roundedUsdAmount}
        </motion.span>
      </div>
    </AnimatePresence>
  );
}

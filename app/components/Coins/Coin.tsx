import { AnimatePresence, motion } from "motion/react";

import { roundCoin } from "~/lib/amount";
import { TokenData } from "~/hooks/resources";

export default function Coin({ token }: { token: TokenData }) {
  const { name, symbol, logoURI, amount, usdAmount } = token;
  const roundedAmount = roundCoin("token", Number(amount)) + "";
  const roundedUsdAmount = roundCoin("usd", Number(usdAmount)) + "";

  return (
    <AnimatePresence initial={false}>
      <motion.div
        initial={{
          x: -15,
          filter: "blur(6px)",
          opacity: 0,
          backgroundColor: "var(--color-background)",
        }}
        whileInView={{
          x: 0,
          opacity: 1,
          filter: "blur(0px)",
        }}
        exit={{
          x: -15,
          filter: "blur(6px)",
        }}
        viewport={{ margin: "-100px 0px 100px 0px" }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between rounded-xl p-3"
      >
        <div className="flex flex-row items-center gap-6">
          <img
            src={logoURI}
            alt={name}
            className="w-[42px] h-[42px] shrink-0 rounded-full"
          />
          <span className="flex flex-col gap-0">
            <span className="text-left">
              {name === "Wrapped SOL" ? "Solana" : name}
            </span>
            <span className="font-medium flex flex-row gap-1">
              <span className="flex flex-row">{roundedAmount}</span>
              <span>{symbol}</span>
            </span>
          </span>
        </div>
        <div className="font-medium flex mt-auto">
          <span>$</span>
          <span>{roundedUsdAmount}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

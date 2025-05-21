import { AnimatePresence, motion } from "motion/react";
import { useBalance } from "~/hooks/resources";

import { Address } from "~/model/web3js";
import { useDialog } from "~/state/dialog";
import { useWithdrawStore } from "~/state/withdraw";
import { getRoundedCoin, getRoundedUSD } from "~/utils/amount";
import { useTokensMeta, useTokensPrice } from "~/hooks/resources";

export default function CoinsMain({ vaultAddress }: { vaultAddress: Address }) {
  const { data, isLoading } = useBalance(vaultAddress);

  // TODO: Add loading state

  if (!data?.spl || isLoading) {
    return null;
  }

  return <Coins coins={data} />;
}

function Coins({ coins }: { coins: any }) {
  const { set } = useWithdrawStore();
  const { onOpenChange } = useDialog("withdraw");

  const tokens = Object.keys(coins?.spl);
  const resMeta = useTokensMeta(tokens);
  const resPrice = useTokensPrice(tokens);

  const tokensMeta = resMeta.map((r) => r.data);
  const tokensPrice = resPrice.map((r) => r.data);

  const _coins = tokens.map((mint) => {
    const amount = coins.spl[mint].amount;
    const amountUSD =
      (Number(amount) / 10 ** coins.spl[mint].decimals) *
        tokensPrice.find((p) => p?.mint === mint)?.price || 0;

    const tokenMeta = tokensMeta.find((t) => t?.address === mint);

    return {
      amount: Number(amount) / 10 ** coins.spl[mint].decimals,
      amountUSD,
      symbol: tokenMeta?.symbol,
      name: tokenMeta?.name,
      logoURI: tokenMeta?.logoURI,
    };
  });

  return (
    <div className="flex flex-1 flex-col gap-0 overflow-y-auto scroll-smooth">
      <AnimatePresence mode="popLayout">
        {_coins
          .filter((c) => c?.amount > 0)
          .map((coin, i) => {
            const { amount, amountUSD, symbol, name, logoURI } = coin;
            const coinAmount =
              typeof amount === "number" ? getRoundedCoin(amount) : amount;
            const usdAmount =
              typeof amountUSD === "number"
                ? getRoundedUSD(amountUSD)
                : amountUSD;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  opacity: {
                    delay: i * 0.04,
                    duration: 1,
                  },
                  y: {
                    delay: i * 0.04,
                    duration: 1,
                  },
                }}
                onClick={() => {
                  set("token", coin);
                  onOpenChange(true);
                }}
                whileHover={{
                  backgroundColor: "var(--color-trn-hover)",
                  transition: { duration: 0.2, delay: 0 },
                }}
                className="flex items-center justify-between cursor-pointer rounded-[20px] p-3"
              >
                <div className="flex flex-row items-center gap-6">
                  <span className="w-[42px] h-[42px] shrink-0 bg-black rounded-full flex items-center justify-center overflow-hidden">
                    <img src={logoURI} alt={name} />
                  </span>
                  <span className="flex flex-col gap-0">
                    <span className="font-semibold">
                      {name === "Wrapped SOL" ? "Solana" : name}
                    </span>
                    <span className="opacity-40 font-medium">
                      {coinAmount}
                      <span>{symbol}</span>
                    </span>
                  </span>
                </div>
                <div className="font-medium flex mt-auto">
                  <span>$</span>
                  <span>{usdAmount}</span>
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}

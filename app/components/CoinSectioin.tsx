import { motion } from "motion/react";

import { useWalletStore } from "~/state/wallet";
import { useVaultTokens } from "~/state/totalBalance";

import { cn } from "~/utils/tw";
import { Address } from "~/model/web3js";
import { useBalanceQuery } from "~/state/balance";
import { useWithdrawStore } from "~/state/withdraw";
import { getRoundedCoin, getRoundedUSD } from "~/utils/amount";

export default function CoinsSection() {
  const { currentMultisigWallet } = useWalletStore();

  if (!currentMultisigWallet?.defaultVault) {
    return null;
  }

  return <Coins address={currentMultisigWallet?.defaultVault} />;
}

function Coins({ address }: { address: Address }) {
  const { set } = useWithdrawStore();
  const { data, isLoading } = useBalanceQuery({ address });

  const { coins } = useVaultTokens({ address, balanceData: data });

  // TODO: Add loading state

  return (
    <section className="w-full h-full flex flex-col gap-4">
      <h3 className="font-semibold text-xl">Coins</h3>
      <div className="flex-1 flex flex-col gap-5 scroll-smooth overflow-y-auto grow pr-4">
        {coins.map((coin, i) => {
          if (!coin || !coin.amount) {
            return null;
          }

          const { amount, symbol, amountUSD, name, logoURI } = coin;

          const coinAmount =
            typeof amount === "number" ? getRoundedCoin(amount) : amount;
          const usdAmount =
            typeof amountUSD === "number"
              ? getRoundedUSD(amountUSD)
              : amountUSD;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => set("token", coin)}
              className={cn("flex items-center justify-between", {
                "cursor-pointer": coin.symbol !== "SOL",
              })}
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
      </div>
    </section>
  );
}

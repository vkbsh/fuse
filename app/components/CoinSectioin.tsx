import { motion } from "motion/react";

import { useWalletStore } from "~/state/wallet";
import { useWalletTokens } from "~/state/totalBalance";

import { Address } from "~/model/web3js";
import { getRoundedCoin, getRoundedUSD } from "~/utils/amount";

export default function CoinsSection() {
  const { currentMultisigWallet } = useWalletStore();
  const vaultAddress = currentMultisigWallet?.defaultVault;

  if (!vaultAddress) {
    return null;
  }

  return <Coins address={vaultAddress} />;
}

function Coins({ address }: { address: Address }) {
  const { coins } = useWalletTokens({ address });

  return (
    <div className="flex-1 flex flex-col gap-5 scroll-smooth overflow-y-auto grow pr-4">
      {coins.map((coin, i) => {
        if (!coin) {
          return null;
        }

        const { amount, symbol, amountUSD, name, logoURI } = coin;

        const coinAmount =
          typeof amount === "number" ? getRoundedCoin(amount) : amount;
        const usdAmount =
          typeof amountUSD === "number" ? getRoundedUSD(amountUSD) : amountUSD;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between"
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
  );
}

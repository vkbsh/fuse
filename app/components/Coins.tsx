import { Address } from "gill";
import { useTokenInfo } from "~/hooks/resources";
import { AnimatePresence, motion } from "motion/react";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";

import { roundCoin } from "~/utils/amount";

import { hasCloudPermission } from "~/program/multisig/utils/member";

export default function Coins({ vaultAddress }: { vaultAddress: Address }) {
  const { set } = useWithdrawStore();
  const { onOpenChange } = useDialog("withdraw");
  const { walletStorage, multisigStorage } = useWalletStore();
  const { data, isLoading, isError } = useTokenInfo(vaultAddress);

  const hasAllPermissions = hasCloudPermission(
    multisigStorage?.account?.members || [],
    walletStorage?.address as Address,
  );

  return (
    <div className="flex flex-1 flex-col gap-0 overflow-y-auto scroll-smooth scrollbar-hidden">
      <AnimatePresence mode="popLayout">
        {data.map((token, i) => {
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { duration: 0.6, delay: i * 0.05 },
              }}
            >
              <Coin
                key={token.mint}
                token={token}
                onClick={() => {
                  if (!hasAllPermissions) return;

                  set("token", token);
                  onOpenChange(true);
                }}
                isLoading={isLoading || isError}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function Coin({
  token,
  isLoading,
  onClick,
}: {
  token: any;
  isLoading: boolean;
  onClick: () => void;
}) {
  const { name, symbol, logoURI, amount, usdAmount } = token;
  const roundedAmount = amount ? roundCoin("token", Number(amount)) : "0.00";
  const roundedUsdAmount = usdAmount
    ? roundCoin("usd", Number(usdAmount))
    : "0.00";

  return (
    <motion.div
      onClick={onClick}
      whileHover={{
        backgroundColor: "var(--color-trn-hover)",
        transition: { duration: 0.6, delay: 0 },
      }}
      className="flex items-center justify-between cursor-pointer rounded-[20px] p-3"
    >
      <div className="flex flex-row items-center gap-6">
        <span className="w-[42px] h-[42px] shrink-0 bg-black rounded-full flex items-center justify-center overflow-hidden">
          <img src={logoURI} alt={name} />
        </span>
        <motion.span
          transition={{
            duration: isLoading ? 2 : 0.6,
            repeat: isLoading ? Infinity : 0,
          }}
          animate={{ opacity: isLoading ? [0.2, 1, 0.2] : 1 }}
          className="flex flex-col gap-0"
        >
          <span className="font-semibold">
            {name === "Wrapped SOL" ? "Solana" : name}
          </span>
          <span className="opacity-40 font-medium flex flex-row gap-1">
            <span>{roundedAmount}</span>
            <span>{symbol}</span>
          </span>
        </motion.span>
      </div>
      <motion.div
        animate={{ opacity: isLoading ? [0.2, 1, 0.2] : 1 }}
        transition={{
          duration: isLoading ? 2 : 0.6,
          repeat: isLoading ? Infinity : 0,
        }}
        className="font-medium flex mt-auto"
      >
        <span>$</span>
        <span>{roundedUsdAmount}</span>
      </motion.div>
    </motion.div>
  );
}

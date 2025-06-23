import { Address } from "gill";
import { AnimatePresence, motion } from "motion/react";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";
import { useTokenInfo } from "~/hooks/resources";

import { hasCloudPermission } from "~/program/multisig/utils/member";

import Coin from "./Coin";

export default function Coins({ vaultAddress }: { vaultAddress: Address }) {
  const { set } = useWithdrawStore();
  const { onOpenChange } = useDialog("withdraw");
  const { walletStorage, multisigStorage } = useWalletStore();
  const { data, isLoading, isError } = useTokenInfo(vaultAddress);

  const hasAllPermissions = hasCloudPermission(
    multisigStorage?.account?.members || [],
    walletStorage?.address,
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

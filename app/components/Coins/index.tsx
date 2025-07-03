import { Address } from "gill";
import { AnimatePresence } from "motion/react";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";
import { useTokenInfo } from "~/hooks/resources";

import { hasCloudPermission } from "~/program/multisig/utils/member";

import Animate from "~/components/animated/Animate";
import Coin from "./Coin";

export default function Coins({ vaultAddress }: { vaultAddress: Address }) {
  const { set } = useWithdrawStore();
  const { data } = useTokenInfo(vaultAddress);
  const { onOpenChange } = useDialog("withdraw");
  const { walletStorage, multisigStorage } = useWalletStore();

  const hasAllPermissions = hasCloudPermission(
    multisigStorage?.account?.members || [],
    walletStorage?.address,
  );

  return (
    <div className="flex flex-1 flex-col gap-0 overflow-y-auto scroll-smooth scrollbar-hidden">
      <AnimatePresence>
        {data.map((token, i) => {
          if (!token) return null;

          const handleClick = () => {
            if (!hasAllPermissions) return;

            set("token", token);
            onOpenChange(true);
          };

          return (
            <Animate
              variant="fadeInList"
              key={token.address}
              transition={{ duration: 0.6, delay: i * 0.06 }}
            >
              <Coin token={token} onClick={handleClick} />
            </Animate>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

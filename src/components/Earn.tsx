import { toast } from "sonner";

import { type Address } from "gill";
import { AnimatePresence } from "motion/react";

import { useDialogStore } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";

import { type EarnCoin, useEarnBalance } from "~/hooks/resources";

import { hasCloudPermission } from "~/program/multisig/utils/member";

import ListItem from "~/components/ListItem";
import EmptyState from "~/components/EmptyState";
import CoinEarn from "~/components/Coins/CoinEarn";
import CoinSkeleton from "~/components/Coins/CoinSkeleton";

export default function Earn({ vaultAddress }: { vaultAddress: Address }) {
  const earnBalance = useEarnBalance(vaultAddress);
  const { onOpenChange } = useDialogStore("withdrawEarn");
  const walletStorage = useWalletStore((s) => s.walletStorage);
  const multisigStorage = useWalletStore((s) => s.multisigStorage);

  const walletAddress = walletStorage?.address;
  const members = multisigStorage?.account?.members || [];
  const hasAllPermissions = hasCloudPermission(members, walletAddress);

  const handleClick = (earnCoin: EarnCoin) => {
    if (!hasAllPermissions) {
      toast.error("Only Cloud Key allowed to withdraw funds");
    } else {
      onOpenChange(true, earnCoin);
    }
  };

  return (
    <AnimatePresence>
      {earnBalance.isLoading ? (
        <div className="h-16 -mx-3">
          <CoinSkeleton />
        </div>
      ) : earnBalance.isFetched && !earnBalance.data?.length ? (
        <EmptyState key="emptyState" label="No Earns yet" />
      ) : (
        <div className="flex flex-col -mx-3">
          {earnBalance.data.map((coinEarn, i) => {
            if (!coinEarn) return null;

            return (
              <ListItem
                index={i}
                key={coinEarn?.id + coinEarn?.programId}
                onClick={() => handleClick(coinEarn)}
              >
                <CoinEarn coin={coinEarn} />
              </ListItem>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

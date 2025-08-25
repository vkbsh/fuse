import { Address } from "gill";
import { toast } from "sonner";
import { AnimatePresence } from "motion/react";

import Coin from "~/components/Coins/Coin";
import ListItem from "~/components/ListItem";
import CoinSkeleton from "~/components/Coins/CoinSkeleton";

import { useWalletStore } from "~/state/wallet";
import { useDialogStore } from "~/state/dialog";
import { useWithdrawStore } from "~/state/withdraw";
import { TokenData, useTokenInfo } from "~/hooks/resources";
import { hasCloudPermission } from "~/program/multisig/utils/member";

export default function Coins({ vaultAddress }: { vaultAddress: Address }) {
  const { data, isFetched } = useTokenInfo(vaultAddress);
  const hasData = isFetched && data?.length;

  return (
    <div className="flex flex-1 flex-col gap-0.5 overflow-y-scroll scroll-smooth scrollbar-hidden -mx-3">
      <AnimatePresence mode="wait">
        {!hasData ? <CoinSkeleton /> : <CoinList data={data} />}
      </AnimatePresence>
    </div>
  );
}

function CoinList({ data }: { data: TokenData[] }) {
  const { onOpenChange } = useDialogStore("withdraw");
  const set = useWithdrawStore((state) => state.set);
  const reset = useWithdrawStore((state) => state.reset);
  const walletStorage = useWalletStore((state) => state.walletStorage);
  const multisigStorage = useWalletStore((state) => state.multisigStorage);

  const walletAddress = walletStorage?.address;
  const members = multisigStorage?.account?.members || [];
  const hasAllPermissions = hasCloudPermission(members, walletAddress);

  if (!hasAllPermissions) {
    return data.map((token, i) => {
      return (
        <ListItem
          index={i}
          key={token.address}
          disabled={!hasAllPermissions}
          onClick={() =>
            toast.error("Only Cloud Key allowed to withdraw funds")
          }
        >
          <Coin token={token} />
        </ListItem>
      );
    });
  }

  return data.map((token, i) => {
    return (
      <ListItem
        index={i}
        key={token.address}
        disabled={!hasAllPermissions}
        onClick={() => {
          reset();
          set("token", token);
          onOpenChange(true);
        }}
      >
        <Coin token={token} />
      </ListItem>
    );
  });
}

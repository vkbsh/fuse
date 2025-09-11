import { toast } from "sonner";
import { type Address } from "gill";
import { AnimatePresence } from "motion/react";

import Coin from "~/components/Coins/Coin";
import ListItem from "~/components/ListItem";
import CoinSkeleton from "~/components/Coins/CoinSkeleton";

import { useWalletStore } from "~/state/wallet";
import { useDialogStore } from "~/state/dialog";
import { type TokenData, useTokenInfo } from "~/hooks/resources";

import { hasCloudPermission } from "~/program/multisig/utils/member";

export default function Coins({ vaultAddress }: { vaultAddress: Address }) {
  const { data, isFetched } = useTokenInfo(vaultAddress);
  const hasData = isFetched && data?.length;

  return (
    <div className="flex flex-1 flex-col gap-0.5 overflow-y-scroll scroll-smooth scrollbar-hidden -mx-3">
      <AnimatePresence>
        {!hasData ? <CoinSkeleton /> : <CoinList data={data} />}
      </AnimatePresence>
    </div>
  );
}

function CoinList({ data }: { data: TokenData[] }) {
  const { onOpenChange } = useDialogStore("withdraw");
  const walletStorage = useWalletStore((s) => s.walletStorage);
  const multisigStorage = useWalletStore((s) => s.multisigStorage);

  const walletAddress = walletStorage?.address;
  const members = multisigStorage?.account?.members || [];
  const hasAllPermissions = hasCloudPermission(members, walletAddress);

  return data.map((token, i) => {
    return (
      <ListItem
        index={i}
        key={token.address}
        onClick={() => {
          if (!hasAllPermissions) {
            toast.error("Only Cloud Key allowed to withdraw funds");
          } else {
            onOpenChange(true, token);
          }
        }}
      >
        <Coin token={token} />
      </ListItem>
    );
  });
}

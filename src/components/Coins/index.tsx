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

  return (
    <div className="flex flex-1 flex-col gap-0.5 overflow-y-scroll scroll-smooth scrollbar-hidden -mx-3">
      <AnimatePresence>
        {!isFetched && data?.length ? (
          <CoinSkeleton />
        ) : (
          <CoinList data={data} />
        )}
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

  const handleClick = (token: TokenData) => {
    if (!hasAllPermissions) {
      toast.error("Only Cloud Key allowed to withdraw funds");
    } else {
      onOpenChange(true, token);
    }
  };

  const verified = data.filter((t) => t?.usdPrice);
  const unverified = data.filter((t) => !t?.usdPrice);

  const renderTokens = (tokens: TokenData[]) =>
    tokens.map((token, i) =>
      token ? (
        <ListItem key={token.id} index={i} onClick={() => handleClick(token)}>
          <Coin token={token} />
        </ListItem>
      ) : null,
    );

  return (
    <>
      {renderTokens(verified)}
      {unverified.length > 0 && (
        <>
          <span className="p-4 font-bold">Unverified assets</span>
          {renderTokens(unverified)}
        </>
      )}
    </>
  );
}

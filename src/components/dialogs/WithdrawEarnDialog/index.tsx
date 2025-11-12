import type { Address } from "gill";

import { useWalletStore } from "~/state/wallet";
import { type EarnCoin } from "~/hooks/resources";

import Content from "./ContentWithdrawEarnDialog";

export default function WithdrawDialogContent({
  data,
  onOpenChange,
}: {
  data: EarnCoin;
  onOpenChange: (open: boolean) => void;
}) {
  const walletName = useWalletStore((s) => s.walletStorage?.name);
  const multisigAddress = useWalletStore((s) => s.multisigStorage?.address);
  const vaultAddress = useWalletStore((s) => s.multisigStorage?.defaultVault);

  return (
    <Content
      initEarnCoin={data}
      walletName={walletName as string}
      vaultAddress={vaultAddress as Address}
      multisigAddress={multisigAddress as Address}
      onCloseDialog={() => onOpenChange(false)}
    />
  );
}

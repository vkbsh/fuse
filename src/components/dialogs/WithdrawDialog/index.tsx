import type { Address } from "gill";

import { useWalletStore } from "~/state/wallet";
import { type TokenData } from "~/hooks/resources";

import Content from "./ContentWithdrawDialog";

export default function WithdrawDialogContent({
  data,
  onOpenChange,
}: {
  data: TokenData;
  onOpenChange: (open: boolean) => void;
}) {
  const walletName = useWalletStore((s) => s.walletStorage?.name);
  const multisigAddress = useWalletStore((s) => s.multisigStorage?.address);
  const vaultAddress = useWalletStore((s) => s.multisigStorage?.defaultVault);

  return (
    <Content
      data={data}
      walletName={walletName as string}
      vaultAddress={vaultAddress as Address}
      multisigAddress={multisigAddress as Address}
      onCloseDialog={() => onOpenChange(false)}
    />
  );
}

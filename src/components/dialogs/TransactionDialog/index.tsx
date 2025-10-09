import type { Address } from "gill";
import { type UiWalletAccount } from "@wallet-standard/react";

import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";
import Content from "./ContentTransactionDialog";

export default function TransactionDialogContent({
  data,
  onOpenChange,
}: {
  data: unknown;
  onOpenChange: (open: boolean) => void;
}) {
  const walletName = useWalletStore((s) => s.walletStorage?.name);
  const wallet = useWalletByName(walletName as string);
  const walletAccount = wallet?.accounts[0];
  const vaultAddress = useWalletStore((s) => s.multisigStorage?.defaultVault);

  if (!wallet || !walletAccount || !vaultAddress) {
    return null;
  }

  return (
    <Content
      data={data}
      onCloseDialog={() => onOpenChange(false)}
      vaultAddress={vaultAddress as Address}
      walletAccount={walletAccount as UiWalletAccount}
    />
  );
}

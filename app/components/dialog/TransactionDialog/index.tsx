import { Address } from "gill";
import { UiWalletAccount } from "@wallet-standard/react";

import { DialogContent } from "~/components/ui/dialog";
import Transaction from "~/components/Transactions/Transaction";
import Footer from "~/components/dialog/TransactionDialog/TransactionFooter";
import Progress from "~/components/dialog/TransactionDialog/TransactionProgress";

import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";

export default function TransactionDialogContent({
  data,
  isOpen,
  onOpenChange,
}: {
  data: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const walletName = useWalletStore((state) => state.walletStorage?.name);
  const wallet = useWalletByName(walletName as Address);
  const walletAccount = wallet?.accounts[0];
  const vaultAddress = useWalletStore(
    (state) => state.multisigStorage?.defaultVault,
  );

  const {
    status,
    creator,
    message,
    rejected,
    approved,
    timestamp,
    cancelled,
    rentCollector,
    transactionIndex,
  } = data || {};

  return (
    <DialogContent isOpen={isOpen}>
      <Transaction status={status} message={message} timestamp={timestamp} />
      <Progress
        status={status}
        executed={creator}
        approved={approved}
        rejected={rejected}
        initiated={creator}
        cancelled={cancelled}
      />
      <Footer
        status={status}
        approved={approved}
        rejected={rejected}
        cancelled={cancelled}
        vaultAddress={vaultAddress as Address}
        walletAccount={walletAccount as UiWalletAccount}
        transactionIndex={transactionIndex}
        rentCollectorAddress={rentCollector}
        closeDialog={() => onOpenChange(false)}
      />
    </DialogContent>
  );
}

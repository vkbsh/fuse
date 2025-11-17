import { type Address } from "gill";
import { type UiWalletAccount } from "@wallet-standard/react";

import Transaction from "~/components/Transactions/Transaction";
import Footer from "~/components/dialogs/TransactionDialog/TransactionFooter";
import Progress from "~/components/dialogs/TransactionDialog/TransactionProgress";

export default function ContentTransactionDialog({
  data,
  vaultAddress,
  onCloseDialog,
  walletAccount,
}: {
  data: any;
  vaultAddress: Address;
  walletAccount: UiWalletAccount;
  onCloseDialog: () => void;
}) {
  const {
    status,
    creator,
    message,
    rejected,
    approved,
    timestamp,
    cancelled,
    threshold,
    rentCollector,
    transactionIndex,
    staleTransactionIndex,
  } = data || {};

  return (
    <>
      <Transaction status={status} message={message} timestamp={timestamp} />
      <Progress
        status={status}
        approved={approved}
        rejected={rejected}
        initiated={creator}
        cancelled={cancelled}
      />
      <Footer
        status={status}
        approved={approved}
        rejected={rejected}
        threshold={threshold}
        cancelled={cancelled}
        onCloseDialog={onCloseDialog}
        transactionIndex={transactionIndex}
        rentCollectorAddress={rentCollector}
        vaultAddress={vaultAddress as Address}
        staleTransactionIndex={staleTransactionIndex}
        walletAccount={walletAccount as UiWalletAccount}
      />
    </>
  );
}

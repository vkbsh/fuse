import { type Address } from "gill";
import { AnimatePresence } from "motion/react";

import ListItem from "~/components/ListItem";
import Transaction from "~/components/Transactions/Transaction";
import TransactionSkeleton from "~/components/Transactions/TransactionSkeleton";
import EmptyState from "~/components/EmptyState";

import { useDialogStore } from "~/state/dialog";
import { type MultisigAccount } from "~/program/multisig/codec";
import { useMultisigAccount, useHydratedTransactions } from "~/hooks/resources";
import { type Status } from "~/components/dialogs/TransactionDialog/TransactionProgress";

export default function Transactions({
  multisigAddress,
}: {
  multisigAddress: Address;
}) {
  const { data: multisigAccount } = useMultisigAccount(multisigAddress);

  if (!multisigAccount) {
    return null;
  }

  return (
    <WithAccount
      multisigAddress={multisigAddress}
      multisigAccount={multisigAccount}
      staleTransactionIndex={multisigAccount?.staleTransactionIndex}
    />
  );
}

function WithAccount({
  multisigAccount,
  multisigAddress,
  staleTransactionIndex,
}: {
  multisigAddress: Address;
  multisigAccount: MultisigAccount;
  staleTransactionIndex: bigint | null | undefined;
}) {
  const {
    isLoading,
    isFetched,
    data: transactions,
  } = useHydratedTransactions(multisigAddress, Number(staleTransactionIndex));
  const { onOpenChange } = useDialogStore("transaction");

  return (
    <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto scroll-smooth scrollbar-hidden -mx-3">
      <AnimatePresence>
        {isFetched &&
          transactions?.length &&
          transactions?.map((data, i) => {
            const { status, message, timestamp, transactionIndex } = data || {};

            return (
              <ListItem
                index={i}
                key={transactionIndex}
                onClick={() =>
                  onOpenChange(true, {
                    ...data,
                    threshold: multisigAccount?.threshold,
                    rentCollector: multisigAccount?.rentCollector,
                  })
                }
              >
                <Transaction
                  message={message}
                  status={status as Status}
                  timestamp={timestamp as number}
                />
              </ListItem>
            );
          })}
      </AnimatePresence>
      {isLoading && !transactions?.length && (
        <TransactionSkeleton key="skeleton" />
      )}
      {isFetched && !transactions?.length && (
        <EmptyState key="emptyState" label="No transactions yet" />
      )}
    </div>
  );
}

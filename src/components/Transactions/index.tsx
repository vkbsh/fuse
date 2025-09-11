import { type Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import ListItem from "~/components/ListItem";
import Transaction from "~/components/Transactions/Transaction";
import TransactionSkeleton from "~/components/Transactions/TransactionSkeleton";
import TransactionEmptyState from "~/components/Transactions/TransactionEmptyState";

import { useDialogStore } from "~/state/dialog";
import { useMultisigAccount, useHydratedTransactions } from "~/hooks/resources";

export type Status = "ready" | "executed" | "cancelled";

export default function Transactions({
  multisigAddress,
}: {
  multisigAddress: Address;
}) {
  const { data: multisigAccount } = useMultisigAccount(multisigAddress);

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
  multisigAccount: any;
  multisigAddress: Address;
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
                    rentCollector: multisigAccount?.rentCollector,
                  })
                }
              >
                <Transaction
                  status={status}
                  message={message}
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
        <TransactionEmptyState key="emptyState" />
      )}
    </div>
  );
}

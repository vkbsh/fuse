import { Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import ListItem from "~/components/ListItem";
import Transaction from "~/components/Transactions/Transaction";
import TransactionSkeleton from "~/components/Transactions/TransactionSkeleton";
import TransactionEmptyState from "~/components/Transactions/TransactionEmptyState";

import {
  useTokensMeta,
  useTransactions,
  useMultisigAccount,
} from "~/hooks/resources";
import { useDialogStore } from "~/state/dialog";

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
      staleTransactionIndex={multisigAccount?.staleTransactionIndex}
    />
  );
}

function WithAccount({
  multisigAddress,
  staleTransactionIndex,
}: {
  multisigAddress: Address;
  staleTransactionIndex: bigint | null | undefined;
}) {
  const {
    isLoading,
    isFetched,
    data: transactionList,
  } = useTransactions(multisigAddress, Number(staleTransactionIndex));
  const { onOpenChange } = useDialogStore("transaction");

  const tokensMeta = useTokensMeta(
    Array.from(
      new Set(
        transactionList?.map(
          (txData) => txData?.message?.mintAddress as Address,
        ) || [],
      ),
    ),
  );

  const transactions = transactionList
    ?.map((txData) => {
      const { mintAddress } = txData?.message || {};
      const tokenMeta = tokensMeta.find((t) => t.data?.address === mintAddress);

      if (!tokenMeta?.data || !txData?.message) {
        return null;
      }

      return {
        ...txData,
        message: {
          ...txData?.message,
          mint: tokenMeta?.data,
          amount:
            Number(txData?.message?.amount) /
            10 ** (tokenMeta?.data?.decimals || 0),
        },
      };
    })
    .filter(Boolean);

  return (
    <motion.div className="flex flex-1 flex-col gap-0.5 overflow-y-auto scroll-smooth scrollbar-hidden -mx-3">
      <AnimatePresence>
        {isFetched &&
          transactions?.length &&
          transactions?.map((data, i) => {
            const { status, message, timestamp, transactionIndex } = data || {};

            return (
              <ListItem
                index={i}
                key={transactionIndex}
                onClick={() => onOpenChange(true, data)}
              >
                <Transaction
                  status={status}
                  message={message}
                  timestamp={timestamp}
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
    </motion.div>
  );
}

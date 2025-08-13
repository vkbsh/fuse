import { Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import {
  useTokensMeta,
  useTransactions,
  useMultisigAccount,
} from "~/hooks/resources";
import { fadeInListItemProps } from "~/lib/motion";

import TransactionDialog from "../TransactionDialog";
import TransactionSkeleton from "./TransactionSkeleton";

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
      rentCollectorAddress={multisigAccount?.rentCollector}
      staleTransactionIndex={multisigAccount?.staleTransactionIndex}
    />
  );
}

function WithAccount({
  rentCollectorAddress,
  multisigAddress,
  staleTransactionIndex,
}: {
  multisigAddress: Address;
  staleTransactionIndex: bigint | null | undefined;
  rentCollectorAddress: Address | null | undefined;
}) {
  const {
    isLoading,
    isFetched,
    data: transactionList,
  } = useTransactions(multisigAddress, Number(staleTransactionIndex));

  const tokensMeta = useTokensMeta(
    Array.from(
      new Set(
        transactionList?.map(
          (txData) => txData?.message?.mintAddress as Address,
        ) || [],
      ),
    ),
  );

  const transactions = transactionList?.map((txData) => {
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
  });

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto scroll-smooth scrollbar-hidden">
      <AnimatePresence mode="wait">
        {isFetched &&
          transactions?.length &&
          transactions?.map((data, i) => (
            <motion.div
              key={data?.transactionIndex}
              {...fadeInListItemProps(i)}
            >
              <TransactionDialog
                data={data}
                rentCollectorAddress={rentCollectorAddress}
              />
            </motion.div>
          ))}
        {isLoading && !transactions?.length && <TransactionLoadingState />}
        {isFetched && !transactions?.length && <TransactionEmptyState />}
      </AnimatePresence>
    </div>
  );
}

function TransactionEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-center items-center"
    >
      <img
        alt="No transactions yet"
        src="/empty-transaction-placeholder.svg"
        className="w-[274px] h-[142px]"
      />
      <span className="text-lg">No transactions yet</span>
    </motion.div>
  );
}

function TransactionLoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full flex gap-4 p-3"
    >
      <TransactionSkeleton />
    </motion.div>
  );
}

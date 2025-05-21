import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import Transaction from "~/components/Transaction";
import { useMultisigAccount, useTransactions } from "~/hooks/resources";

import { Address } from "~/model/web3js";
import { useDialog } from "~/state/dialog";

export type Status = "ready" | "executed" | "cancelled";

export default function Transactions({
  multisigAddress,
}: {
  multisigAddress: Address;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const { onOpenChange } = useDialog("transaction");
  const { data: multisigAccount } = useMultisigAccount(multisigAddress);

  const transactionIndex = Number(multisigAccount?.transactionIndex);
  const indexes = Array.from(
    { length: transactionIndex },
    (_, i) => i,
  ).reverse();

  const _transactions = useMemo(() => {
    const startIdx = 0;
    const endIdx = page * pageSize;

    return indexes.slice(startIdx, endIdx);
  }, [transactionIndex, page]);

  const results = useTransactions(multisigAddress, _transactions);
  const transactions = results.filter((tx) => tx?.data?.message?.amount);
  const isLoading = results.some((result) => result.isLoading);
  const hasMoreTransactions = transactionIndex > page * pageSize;

  useEffect(() => {
    const totalFetched = transactions.length;
    const totalToFetch = page * pageSize;

    if (
      !isLoading &&
      transactions.length < page * pageSize &&
      hasMoreTransactions
    ) {
      setPage(page + 1);
    }
  }, [_transactions, page, isLoading]);

  return (
    <div className="flex flex-1 flex-col gap-0 overflow-y-auto scroll-smooth">
      <AnimatePresence mode="popLayout">
        {!transactionIndex ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex flex-col justify-center items-center">
              <img
                alt="No transactions yet"
                src="/empty-transaction-placeholder.svg"
              />
              <span className="font-semibold text-lg opacity-40">
                No transactions yet
              </span>
            </div>
          </motion.div>
        ) : (
          transactions.map((tx, i) => {
            return (
              <motion.div
                layout
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  y: { delay: i * 0.04, duration: 1 },
                  opacity: { delay: i * 0.04, duration: 1 },
                }}
                whileHover={{
                  backgroundColor: "var(--color-trn-hover)",
                  transition: { duration: 0.2, delay: 0 },
                }}
                onClick={() => {
                  onOpenChange(true, tx.data);
                }}
                className="flex items-center justify-between cursor-pointer rounded-[20px] p-3"
              >
                <Transaction
                  key={tx.data.transactionIndex}
                  status={tx.data.status}
                  message={tx.data.message}
                  timestamp={tx.data.timestamp}
                />
              </motion.div>
            );
          })
        )}
        {/* {hasMoreTransactions && (
          <motion.button
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 py-2 px-4 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            onClick={() => setPage(page + 1)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </motion.button>
        )} */}
      </AnimatePresence>
    </div>
  );
}

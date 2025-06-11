import { motion, AnimatePresence } from "motion/react";

import Transaction from "~/components/Transaction";
import { useTransactions, useMultisigAccount } from "~/hooks/resources";

import { Address } from "~/model/web3js";

export type Status = "ready" | "executed" | "cancelled";

export default function Transactions({
  multisigAddress,
}: {
  multisigAddress: Address;
}) {
  const { data, isLoading } = useTransactions(multisigAddress);
  const { data: multisigAccount } = useMultisigAccount(multisigAddress);

  let transactions =
    data
      ?.flat()
      .filter(Boolean)
      .sort((a, b) => {
        return Number(b.timestamp) - Number(a.timestamp);
      }) || [];

  if (multisigAccount?.staleTransactionIndex) {
    transactions = transactions.filter((txData) =>
      txData?.transactionIndex > multisigAccount?.staleTransactionIndex
        ? true
        : false,
    );
  }

  console.log("isLoading", isLoading);

  const rentCollectorAddress = multisigAccount?.rentCollector as Address;

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto scroll-smooth scrollbar-hidden">
      <AnimatePresence>
        {!isLoading && !transactions?.length && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transactions?.map((txData, i) => {
          return (
            <motion.div
              key={i}
              layout
              initial={{
                y: -10,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.6,
                  delay: i * 0.04,
                },
              }}
            >
              <Transaction
                status={txData?.status}
                creator={txData?.creator}
                message={txData?.message}
                approved={txData?.approved}
                rejected={txData?.rejected}
                cancelled={txData?.cancelled}
                timestamp={txData?.timestamp}
                transactionIndex={txData?.transactionIndex}
                rentCollectorAddress={rentCollectorAddress}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.span
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex w-full h-[68px] justify-center items-center rounded-[20px] text-black/40">
              Loading...
            </div>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

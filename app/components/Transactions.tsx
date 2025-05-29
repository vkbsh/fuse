import { useQueryClient } from "@tanstack/react-query";
import { delay } from "motion";
import { motion, AnimatePresence } from "motion/react";

import Transaction from "~/components/Transaction";
import {
  queryKeys,
  useMultisigAccount,
  useTransactionBatch,
} from "~/hooks/resources";

import { Address } from "~/model/web3js";

export type Status = "ready" | "executed" | "cancelled";

const batchSize = 10;

export default function Transactions({
  multisigAddress,
}: {
  multisigAddress: Address;
}) {
  const queryClient = useQueryClient();
  const { data: multisigAccount } = useMultisigAccount(multisigAddress);

  const lastTxIndex = multisigAccount?.transactionIndex
    ? Number(multisigAccount?.transactionIndex)
    : undefined;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTransactionBatch(
      multisigAddress,
      batchSize,
      Number(multisigAccount?.transactionIndex),
      // Number(multisigAccount?.staleTransactionIndex),
      0,
    );

  const transactions = data?.pages.flatMap((page) => page) || [];

  const loadMoreTransactions = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const refetch = async (transactionIndex: number) => {
    return queryClient.invalidateQueries({
      queryKey: [queryKeys.transaction, multisigAddress, transactionIndex],
      exact: true,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-0 overflow-y-auto scroll-smooth">
      <AnimatePresence>
        {lastTxIndex === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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
        {lastTxIndex &&
          !transactions.length &&
          Array.from({ length: batchSize }).map((_, i) => (
            <motion.div
              key={i}
              layout
              initial={{
                opacity: 0,
                y: -10,
                filter: "blur(3px)",
              }}
              animate={{
                y: 0,
                opacity: 1,
                transition: {
                  duration: 2,
                  delay: i * 0.05,
                },
              }}
              exit={{
                opacity: 0.8,
                transition: {
                  duration: 0.1,
                },
              }}
            >
              <Transaction
                status="Active"
                timestamp={3000}
                creator="G5JD6WrkWjMFhRoiNiA6x3mELZPJvETFbv2jvKFePnmY"
                message={{
                  amount: 100000,
                  toAccount: "BVkj5GFnMNoXimvWTZAQFgNZFQ4jvPSVQ8EBswGpCnN7",
                  mint: {
                    name: "Token",
                    symbol: "TOK",
                    logoURI:
                      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
                    decimals: 0,
                    address: "G5JD6WrkWjMFhRoiNiA6x3mELZPJvETFbv2jvKFePnmY",
                  },
                }}
                approved={["txData?.approved"]}
                rejected={["txData?.rejected"]}
                cancelled={["txData?.cancelled"]}
                rentCollectorAddress={"multisigAccount?.rentCollector"}
              />
            </motion.div>
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {transactions.map((txData, i) => {
          const batchIndex = i % batchSize;
          const delay = batchIndex * 0.04;

          return (
            <motion.div
              key={i}
              layout
              initial={{
                opacity: 0.8,
                filter: "blur(3px)",
              }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                transition: {
                  delay,
                  duration: 1,
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
                refetch={() => refetch(txData?.transactionIndex)}
                rentCollectorAddress={multisigAccount?.rentCollector}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {hasNextPage && (
          <motion.span
            key="load-more"
            viewport={{ margin: "200px" }}
            onClick={loadMoreTransactions}
            onViewportEnter={loadMoreTransactions}
          >
            <div className="flex w-full h-[68px] justify-center items-center rounded-[20px] text-black/40">
              Loading...
            </div>
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transactions.length && !isFetchingNextPage && !hasNextPage && (
          <motion.div
            key="no-transactions"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex w-full h-[68px] justify-center items-center rounded-[20px] text-black/40">
              No more transactions
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

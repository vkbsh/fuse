import { Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import Transaction from "~/components/Transaction";
import {
  useTokensMeta,
  useTransactions,
  useMultisigAccount,
} from "~/hooks/resources";

export type Status = "ready" | "executed" | "cancelled";

export default function Transactions({
  multisigAddress,
}: {
  multisigAddress: Address;
}) {
  const { data: multisigAccount } = useMultisigAccount(multisigAddress);
  const { data, isLoading } = useTransactions(
    multisigAddress,
    multisigAccount?.staleTransactionIndex
      ? Number(multisigAccount?.staleTransactionIndex)
      : 0,
  );

  const tokens: Set<Address> = new Set(
    data?.map((txData) => txData?.message?.mintAddress),
  );
  const tokensMeta = useTokensMeta(Array.from(tokens));
  const transactions = data?.map((txData) => {
    const { mintAddress } = txData?.message || {};
    const tokenMeta = tokensMeta.find((t) => t.data?.address === mintAddress);

    return {
      ...txData,
      message: {
        ...txData?.message,
        mint: tokenMeta?.data,
        amount:
          txData?.message?.amount / 10 ** (tokenMeta?.data?.decimals || 0),
      },
    };
  });

  const rentCollectorAddress = multisigAccount?.rentCollector as Address;

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto scroll-smooth scrollbar-hidden">
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

        {transactions?.map((txData, i) => {
          return (
            <motion.div
              key={txData.timestamp}
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
                status={txData.status}
                message={txData.message}
                rejected={txData.rejected || []}
                approved={txData.approved || []}
                timestamp={txData.timestamp || 0}
                cancelled={txData.cancelled || []}
                creator={txData.creator as Address}
                rentCollectorAddress={rentCollectorAddress}
                transactionIndex={txData.transactionIndex || 0}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

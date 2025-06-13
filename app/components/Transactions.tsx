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
  const { data, isLoading } = useTransactions(multisigAddress);
  const { data: multisigAccount } = useMultisigAccount(multisigAddress);

  let _transactions =
    // TODO: Move to useTransactions
    data
      ?.flat()
      .filter(Boolean)
      .sort((a, b) => {
        return Number(b?.transactionIndex) - Number(a?.transactionIndex);
      }) || [];

  if (multisigAccount?.staleTransactionIndex) {
    // TODO: Move to useTransactions
    _transactions = _transactions.filter((txData) =>
      Number(txData?.transactionIndex) >
      Number(multisigAccount?.staleTransactionIndex)
        ? true
        : false,
    );
  }

  const tokens: Set<Address> = new Set();

  _transactions.forEach((txData) => {
    const { mintAddress } = txData?.message;

    tokens.add(mintAddress);
  });

  const tokensMeta = useTokensMeta(Array.from(tokens));

  const transactions = _transactions.map((txData) => {
    const { mintAddress } = txData?.message;
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
              key={txData.timestamp + txData.status}
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
                status={txData.status}
                creator={txData.creator as Address}
                message={txData.message}
                rejected={txData.rejected || []}
                approved={txData.approved || []}
                cancelled={txData.cancelled || []}
                timestamp={txData.timestamp || 0}
                transactionIndex={txData.transactionIndex || 0}
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

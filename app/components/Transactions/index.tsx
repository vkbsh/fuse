import { Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import {
  useTokensMeta,
  useTransactions,
  useMultisigAccount,
} from "~/hooks/resources";

import Transaction from "./Transaction";
import { MultisigAccount } from "~/program/multisig/codec";

export type Status = "ready" | "executed" | "cancelled";

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
      multisigAccount={multisigAccount}
      multisigAddress={multisigAddress}
    />
  );
}

function WithAccount({
  multisigAccount,
  multisigAddress,
}: {
  multisigAccount: MultisigAccount;
  multisigAddress: Address;
}) {
  const {
    isLoading,
    isFetched,
    data: transactionList,
  } = useTransactions(
    multisigAddress,
    Number(multisigAccount.staleTransactionIndex),
  );

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
          txData?.message?.amount / 10 ** (tokenMeta?.data?.decimals || 0),
      },
    };
  });

  const rentCollectorAddress = multisigAccount?.rentCollector as Address;

  return (
    <div className="relative flex flex-1 flex-col gap-2 overflow-y-auto scroll-smooth scrollbar-hidden">
      <AnimatePresence>
        {transactions?.map((txData, i) => {
          if (!txData) return null;

          return (
            <motion.div
              key={Number(txData.transactionIndex)}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
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
        {isLoading && !transactions?.length && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.6 }}
            className="absolute top-0 m-auto left-0 right-0 flex w-full h-[68px] justify-center items-center rounded-[20px]"
          >
            TODO: Sceleton
          </motion.div>
        )}
        {isFetched && !transactions?.length && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.6 }}
            className="absolute top-0 m-auto left-0 right-0 flex flex-col justify-center items-center"
          >
            <img
              alt="No transactions yet"
              src="/empty-transaction-placeholder.svg"
            />
            <span className="text-lg">No transactions yet</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

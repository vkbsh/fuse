import { Address } from "gill";
import { AnimatePresence } from "motion/react";

import {
  useTokensMeta,
  useTransactions,
  useMultisigAccount,
} from "~/hooks/resources";

import Animate from "~/components/animated/Animate";
import AnimateList from "~/components/animated/AnimateList";
import Transaction from "./Transaction";

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
    <div className="relative flex flex-1 flex-col gap-2 overflow-y-auto scroll-smooth scrollbar-hidden">
      <AnimatePresence>
        {isLoading && (
          <Animate
            variant="fadeIn"
            className="absolute top-0 left-0 w-full h-full"
          >
            <div className="flex w-full h-[68px] justify-center items-center rounded-[20px] text-black-40">
              Loading...
            </div>
          </Animate>
        )}

        {!isLoading && !transactions?.length && (
          <Animate
            variant="slideDown"
            className="absolute top-0 left-0 w-full h-full"
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
          </Animate>
        )}
      </AnimatePresence>
      <AnimateList
        variant="slideDown"
        list={
          transactions
            ? transactions.map((txData) => (
                <Transaction
                  key={txData.timestamp}
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
              ))
            : []
        }
      />
    </div>
  );
}

import { motion } from "motion/react";

import Transaction from "~/components/Transaction";
import TransactionDialog from "~/components/TransactionDialog";

import { Address } from "~/model/web3js";
import { useSuspenseProposalByKey, useWalletStore } from "~/state/wallet";

export type Status = "ready" | "executed" | "cancelled";

export default function TransactionSection() {
  const { currentMultisigWallet, currentWallet } = useWalletStore();
  const multisigAddress = currentMultisigWallet?.address;

  if (!multisigAddress || !currentWallet?.address) {
    return null;
  }

  return (
    <Transactions
      multisigAddress={multisigAddress}
      walletAddress={currentWallet?.address}
    />
  );
}

function Transactions({
  walletAddress,
  multisigAddress,
}: {
  walletAddress: Address;
  multisigAddress: Address;
}) {
  const { transactions } = useSuspenseProposalByKey(multisigAddress);

  return (
    <div className="flex flex-1 flex-col gap-0 overflow-y-auto scroll-smooth grow pr-4 -ml-4">
      {!transactions?.length ? (
        <div>
          <div className="flex flex-col justify-center items-center">
            <img
              src="/empty-transaction-placeholder.svg"
              alt="No transactions yet"
            />
            <span className="font-semibold text-lg opacity-40">
              No transactions yet
            </span>
          </div>
        </div>
      ) : (
        transactions.map((data, i) => {
          return (
            <motion.div
              key={data.transactionIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                y: { delay: i * 0.05 },
                opacity: { duration: 0.2 },
              }}
              whileHover={{
                backgroundColor: "var(--color-trn-hover)",
                transition: { duration: 0.2 },
              }}
              className="cursor-pointer p-3 rounded-[20px]"
            >
              <TransactionDialog
                currentWalletAddress={walletAddress}
                currentMultisigWalletAddress={multisigAddress}
                {...data}
              >
                <Transaction {...data} />
              </TransactionDialog>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

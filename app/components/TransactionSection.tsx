import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { UiWalletAccount } from "@wallet-standard/react";

import Transaction from "~/components/Transaction";
import TransactionDialog from "~/components/TransactionDialog";

import { Address } from "~/model/web3js";
import { useWalletStore, proposalByKeyQuery } from "~/state/wallet";

export type Status = "ready" | "executed" | "cancelled";

export default function TransactionSection({
  account,
}: {
  account: UiWalletAccount;
}) {
  const { currentMultisigWallet, currentWallet } = useWalletStore();
  const multisigAddress = currentMultisigWallet?.address;

  if (!multisigAddress || !currentWallet?.address) {
    return null;
  }

  return (
    <Transactions
      walletAccount={account}
      multisigAddress={multisigAddress}
      walletAddress={currentWallet.address}
      rentCollectorAddress={currentMultisigWallet.account.rentCollector}
    />
  );
}

function Transactions({
  walletAddress,
  walletAccount,
  multisigAddress,
  rentCollectorAddress,
}: {
  walletAddress: Address;
  multisigAddress: Address;
  rentCollectorAddress: Address;
  walletAccount: UiWalletAccount;
}) {
  // const transactions = useSuspenseProposalByKey(multisigAddress);

  const { data: { transactions } = {} } = useQuery(
    proposalByKeyQuery({ keyAddress: multisigAddress }),
  );

  return (
    <section className="w-full h-full flex flex-col gap-4">
      <h3 className="font-semibold text-xl">Transactions</h3>

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
                  walletAccount={walletAccount}
                  currentWalletAddress={walletAddress}
                  rentCollectorAddress={rentCollectorAddress}
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
    </section>
  );
}

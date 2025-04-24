import { motion } from "motion/react";
import { MetaFunction } from "react-router";

import Connect from "~/routes/connect";

import Balance from "~/components/Balance";
import CoinSection from "~/components/CoinSectioin";
import { IconLogo } from "~/components/icons/IconLogo";
import SelectMultisigAccount from "~/components/SelectMultisigAccount";
import WithdrawDialog from "~/components/WithdrawDialog";
import DisconnectButton from "~/components/DisconnectButton";
import TransactionSection from "~/components/TransactionSection";

import { useWalletStore } from "~/state/wallet";
import { Suspense } from "react";
import Loading from "~/components/Loading";

export const meta: MetaFunction = () => {
  return [
    { title: "Fuse Web Client - Access your Fuse Account" },
    { name: "description", content: "Access your Fuse Account on the web" },
  ];
};

export default function Index() {
  const { currentMultisigWallet } = useWalletStore();

  if (!currentMultisigWallet) {
    return (
      <Suspense fallback={<Loading />}>
        <Connect />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-10 "
      >
        <header className="h-[42px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-[42px] h-[42px] rounded-full bg-[#EBEBEB] flex items-center justify-center text-black">
              <IconLogo />
            </span>
            <SelectMultisigAccount />
          </div>
          <div className="flex items-center gap-8">
            <WithdrawDialog />
            <DisconnectButton />
          </div>
        </header>
        <Balance />
        <main className="flex-1 flex w-full h-full min-h-0 gap-10">
          <section className="w-full h-full flex flex-col gap-4">
            <h3 className="font-semibold text-xl">Coins</h3>
            <CoinSection />
          </section>
          <span className="w-px bg-black opacity-20" />
          <section className="w-full h-full flex flex-col gap-2">
            <h3 className="font-semibold text-xl">Transactions</h3>
            <TransactionSection />
          </section>
        </main>
      </motion.div>
    </Suspense>
  );
}

import { motion } from "motion/react";
import { MetaFunction } from "react-router";
import { Suspense, useEffect, useState } from "react";

import Connect from "~/routes/connect"; // TODO: move to components
import Loading from "~/components/Loading";
import Balance from "~/components/Balance";
import CoinSection from "~/components/CoinSectioin";
import { IconLogo } from "~/components/icons/IconLogo";
import WithdrawDialog from "~/components/WithdrawDialog";
import TransactionSection from "~/components/TransactionSection";
import SelectVaultAccount from "~/components/SelectVaultAccount";
import RecoveryKeysDropdown from "~/components/RecoveryKeysDropdown";
import { ConnectWalletDialog } from "~/components/ConnectWalletDialog";

import { useWalletStore } from "~/state/wallet";
import { useConnect, useWallets } from "@wallet-standard/react";
import { address } from "gill";

export const meta: MetaFunction = () => {
  return [
    { title: "Fuse Web Client - Access your Fuse Account" },
    { name: "description", content: "Access your Fuse Account on the web" },
  ];
};

export default function Index() {
  const { currentMultisigWallet, currentWallet } = useWalletStore();

  if (!currentMultisigWallet || !currentWallet) {
    return (
      <Suspense fallback={<Loading />}>
        <Connect />
      </Suspense>
    );
  }

  return <Main />;
}

function Main() {
  const wallets = useWallets();
  const { currentWallet, addWallet } = useWalletStore();

  // Try to find the wallet from LocalStorage
  const wallet = wallets
    .filter((w) => w.features.includes("solana:signAndSendTransaction"))
    .find((w) => w.name === currentWallet?.name);

  const [, connect] = useConnect(wallet);
  const account = wallet?.accounts[0];

  useEffect(() => {
    const tryConnectAndAddWallet = async () => {
      let currentAccount = account;

      if (!currentAccount) {
        const accounts = await connect({ silent: true });
        currentAccount = accounts[0];
      }

      if (wallet && currentAccount) {
        // TODO: Add related wallet to multisig
        addWallet({
          name: wallet.name,
          icon: wallet.icon,
          address: address(currentAccount.address),
        });
      }
    };

    tryConnectAndAddWallet();
  }, [account]);

  if (!account) {
    return null;
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
            <SelectVaultAccount />
          </div>
          <div className="flex items-center gap-8">
            <WithdrawDialog walletAccount={account} />
            <RecoveryKeys />
          </div>
        </header>
        <main className="flex-1 flex flex-col w-full h-full min-h-0 gap-10">
          <Balance />
          <div className="flex-1 flex w-full h-full min-h-0 gap-10">
            <section className="w-full h-full flex flex-col gap-4">
              <h3 className="font-semibold text-xl">Coins</h3>
              <CoinSection />
            </section>
            <span className="w-px bg-black opacity-20" />
            <section className="w-full h-full flex flex-col gap-2">
              <h3 className="font-semibold text-xl">Transactions</h3>
              <TransactionSection walletAccount={account} />
            </section>
          </div>
        </main>
      </motion.div>
    </Suspense>
  );
}

function RecoveryKeys() {
  const [isOpenConnectWallet, setOpenConnectWallet] = useState(false);

  // TODO: prevent connecting account not related to current multisig wallet

  return (
    <div>
      <ConnectWalletDialog
        isOpen={isOpenConnectWallet}
        onOpenChange={setOpenConnectWallet}
      />
      <RecoveryKeysDropdown onClick={() => setOpenConnectWallet(true)} />
    </div>
  );
}

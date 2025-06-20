import { Address } from "gill";
import { MetaFunction } from "@remix-run/node";
import { motion, AnimatePresence } from "motion/react";

import Coins from "~/components/Coins";
import Connect from "~/components/Connect";
import Balance from "~/components/Balance";
import { Toasts } from "~/components/ui/Toast";
import Transactions from "~/components/Transactions";
import VaultAccount from "~/components/VaultAccount";
import WithdrawButton from "~/components/WithdrawButton";
import MemberKeysDropdown from "~/components/MemberKeysDropdown";
import AutoReconnectWallet from "~/components/AutoReconnectWallet";
import { ConnectWalletDialog } from "~/components/ConnectWalletDialog";
import WithdrawDialog from "~/components/withdraw-dialog/WithdrawDialog";

import { useWalletStore } from "~/state/wallet";

export const meta: MetaFunction = () => {
  return [
    { title: "Fuse Web Client - Access your Fuse Account" },
    { name: "description", content: "Access your Fuse Account on the web" },
  ];
};

export default function Index() {
  const { multisigStorage, walletStorage } = useWalletStore();

  const multisigAddress = multisigStorage?.address as Address;
  const vaultAddress = multisigStorage?.defaultVault as Address;

  return (
    <>
      <AnimatePresence mode="popLayout">
        {!multisigStorage || !walletStorage ? (
          <motion.div
            key="connect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
            transition={{ duration: 0.5 }}
            className="h-full flex items-center justify-center"
          >
            <Connect />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
            transition={{ duration: 0.5 }}
            className="h-full flex items-center justify-center"
          >
            <Dashboard
              vaultAddress={vaultAddress}
              walletName={walletStorage.name}
              multisigAddress={multisigAddress}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Toasts />
      <ConnectWalletDialog />
    </>
  );
}

function Dashboard({
  multisigAddress,
  vaultAddress,
  walletName,
}: {
  multisigAddress: Address;
  vaultAddress: Address;
  walletName: string;
}) {
  return (
    <>
      <AutoReconnectWallet name={walletName} />
      <div className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-10 justify-between">
        <header className="h-[42px] flex items-center justify-between">
          <VaultAccount vaultAddress={vaultAddress} />
          <MemberKeysDropdown />
        </header>
        <main className="flex-1 flex flex-col w-full h-full min-h-0 gap-10">
          <div className="flex flex-col">
            <Balance vaultAddress={vaultAddress} />
            <WithdrawButton />
          </div>
          <div className="flex flex-1 w-full h-full min-h-0 justify-between items-stretch">
            <div className="h-full flex flex-1 min-w-0 flex-col gap-4">
              <h3 className="font-semibold text-xl">Coins</h3>
              <Coins vaultAddress={vaultAddress} />
            </div>
            <div className="flex h-auto items-center mx-10">
              <div className="w-px h-full bg-black/20" />
            </div>
            <div className="h-full basis-1/5 flex flex-1 min-w-0 flex-col gap-4">
              <h3 className="font-semibold text-xl">Transactions</h3>
              <Transactions multisigAddress={multisigAddress} />
            </div>
          </div>
        </main>
      </div>
      <WithdrawDialog />
    </>
  );
}

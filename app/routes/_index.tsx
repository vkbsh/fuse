import { MetaFunction } from "@remix-run/node";
import { AnimatePresence } from "motion/react";

import Connect from "~/components/Connect";
import Toasts from "~/components/ui/Toast";
import Dashboard from "~/components/Dashboard";
import Animate from "~/components/animated/Animate";
import ConnectWalletDialog from "~/components/ConnectWalletDialog";

import { useWalletStore } from "~/state/wallet";

export const meta: MetaFunction = () => {
  return [
    { title: "Fuse Web Client - Access your Fuse Account" },
    { name: "description", content: "Access your Fuse Account on the web" },
  ];
};

export default function Index() {
  const { multisigStorage, walletStorage } = useWalletStore();

  return (
    <>
      <AnimatePresence initial={false}>
        {!multisigStorage || !walletStorage ? (
          <Animate
            key="connect"
            variant="fadeIn"
            className="h-full flex items-center justify-center"
          >
            <Connect />
          </Animate>
        ) : (
          <Animate key="dashboard" variant="fadeIn">
            <Dashboard
              walletName={walletStorage.name}
              multisigAddress={multisigStorage.address}
              vaultAddress={multisigStorage.defaultVault}
            />
          </Animate>
        )}
      </AnimatePresence>
      <Toasts />
      <ConnectWalletDialog />
    </>
  );
}

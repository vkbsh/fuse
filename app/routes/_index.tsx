import { MetaFunction } from "@remix-run/node";
import { motion, AnimatePresence } from "motion/react";

import Connect from "~/components/Connect";
import Dashboard from "~/components/Dashboard";
import { Toaster } from "~/components/ui/sonner";

import { useWalletStore } from "~/state/wallet";
import { useAnimationProps } from "~/hooks/animation";

export const meta: MetaFunction = () => {
  return [
    { title: "Fuse Web Client - Access your Fuse Account" },
    { name: "description", content: "Access your Fuse Account on the web" },
  ];
};

export default function Index() {
  const fadeInProps = useAnimationProps("fadeIn");
  const { multisigStorage, walletStorage } = useWalletStore();

  return (
    <>
      {!multisigStorage || !walletStorage ? (
        <Connect />
      ) : (
        <Dashboard
          walletName={walletStorage.name}
          multisigAddress={multisigStorage.address}
          vaultAddress={multisigStorage.defaultVault}
        />
      )}
      <Toaster />
    </>
  );
}

import "./global.css";
import { useWalletStore } from "~/state/wallet";
import { motion, AnimatePresence } from "motion/react";

import Connect from "~/routes/connect";
import Dashboard from "~/routes/dashboard";
import AppDialog from "~/components/dialogs";
import Toaster from "~/components/ui/sonner";

import motionProps from "~/lib/motion";
import { useRpcStore } from "~/state/rpc";
import Input from "./components/ui/input";

export default function App() {
  const walletAddress = useWalletStore((s) => s.walletStorage?.address);
  const multisigAddress = useWalletStore((s) => s.multisigStorage?.address);

  const { rpc } = useRpcStore();

  if (!rpc) {
    // TODO: make dialog with persistent input
    return (
      <motion.div
        className="h-screen flex flex-col justify-center items-center py-4 gap-18"
        {...motionProps.global.fadeIn}
      >
        <div className="flex flex-col items-center gap-4 w-sm">
          Provide RPC_URL_MAINNET in .env
          <Input />
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {!multisigAddress || !walletAddress ? (
          <motion.div
            className="h-screen flex flex-col justify-center items-center py-4 gap-18"
            {...motionProps.global.fadeIn}
          >
            <Connect />
          </motion.div>
        ) : (
          <motion.div
            className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-10 justify-around"
            {...motionProps.global.fadeIn}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
      <AppDialog />
    </>
  );
}

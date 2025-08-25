import { MetaFunction } from "@remix-run/node";
import { motion, AnimatePresence } from "motion/react";

import Connect from "~/components/Connect";
import AppDialog from "~/components/dialog";
import Dashboard from "~/components/Dashboard";
import { Toaster } from "~/components/ui/sonner";

import motionProps from "~/lib/motion";
import { useWalletStore } from "~/state/wallet";

export const meta: MetaFunction = () => {
  return [
    { title: "Fuse Web Client - Access your Fuse Account" },
    { name: "description", content: "Access your Fuse Account on the web" },
  ];
};

export default function Index() {
  const multisigAddress = useWalletStore(
    (state) => state.multisigStorage?.address,
  );

  return (
    <div className="select-none">
      <AnimatePresence mode="popLayout">
        {!multisigAddress ? (
          <motion.div
            key="connect"
            className="h-screen flex flex-col justify-center items-center py-4 gap-18"
            {...motionProps.fadeIn}
          >
            <Connect />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-10 justify-around"
            {...motionProps.fadeIn}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
      <AppDialog />
    </div>
  );
}

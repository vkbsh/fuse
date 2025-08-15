import { MetaFunction } from "@remix-run/node";
import { motion, AnimatePresence } from "motion/react";

import Connect from "~/components/Connect";
import Dashboard from "~/components/Dashboard";
import { Toaster } from "~/components/ui/sonner";

import { useWalletStore } from "~/state/wallet";

export const meta: MetaFunction = () => {
  return [
    { title: "Fuse Web Client - Access your Fuse Account" },
    { name: "description", content: "Access your Fuse Account on the web" },
  ];
};

export default function Index() {
  const multisigStorage = useWalletStore((state) => state.multisigStorage);

  return (
    <AnimatePresence>
      {!multisigStorage?.address ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen flex flex-col justify-center items-center py-4 gap-18"
        >
          <Connect />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 }}
          className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-8 justify-between select-none"
        >
          <Dashboard />
        </motion.div>
      )}
      <Toaster />
    </AnimatePresence>
  );
}

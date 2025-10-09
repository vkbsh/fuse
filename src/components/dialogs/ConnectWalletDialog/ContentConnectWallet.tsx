import { useState } from "react";
import type { UiWallet } from "@wallet-standard/react";
import { motion, AnimatePresence } from "motion/react";

import motionProps from "~/lib/motion";
import WalletOption from "./WalletOption";

export default function Content({
  onCloseDialog,
  supportedWallets,
}: {
  onCloseDialog: () => void;
  supportedWallets: UiWallet[] | null;
}) {
  const [connectingWalletName, setConnectingWalletName] = useState("");

  return (
    <AnimatePresence>
      {!supportedWallets?.length ? (
        <motion.span
          className="flex justify-center items-center py-8"
          {...motionProps.global.fadeIn}
        >
          <span>No supported wallets found</span>
        </motion.span>
      ) : (
        <motion.div
          className="flex flex-col gap-0"
          {...motionProps.global.fadeIn}
        >
          {supportedWallets.map((wallet) => (
            <WalletOption
              wallet={wallet}
              key={wallet.name}
              onCloseDialog={onCloseDialog}
              connectingWalletName={connectingWalletName}
              setConnectingWalletName={setConnectingWalletName}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

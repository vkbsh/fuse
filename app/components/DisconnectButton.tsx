import { motion } from "motion/react";

import Dropdown from "~/components/ui/Dropdown";
import { IconDots } from "~/components/icons/IconDots";
import { IconDisconnect } from "~/components/icons/IconDisconnect";

import { useWalletStore } from "~/state/wallet";
import { abbreviateAddress } from "~/utils/address";

export default function DisconnectButton() {
  const { currentWallet, removeWallet } = useWalletStore();
  const walletAddress = currentWallet?.address
    ? abbreviateAddress(currentWallet?.address)
    : null;

  return (
    <Dropdown
      align="end"
      trigger={<IconDots />}
      items={[
        // <div
        //   onClick={(e) => e.stopPropagation()}
        //   className="p-2 flex items-center justify-between"
        // >
        //   <span className="text-sm">{walletAddress}</span>
        // </div>,
        <motion.span
          onClick={removeWallet}
          className="cursor-pointer flex flex-row items-center p-2 gap-8"
          whileHover={{ color: "var(--color-status-error)" }}
        >
          <span className="text-sm">Disconnect</span>
          <IconDisconnect />
        </motion.span>,
      ]}
    />
  );
}

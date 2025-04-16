import { motion } from "motion/react";

import Dropdown from "~/components/ui/Dropdown";
import { IconDots } from "~/components/icons/IconDots";
import { IconDisconnect } from "~/components/icons/IconDisconnect";
import { ConnectWalletDialog } from "~/components/ConnectWalletDialog";

import { useWalletStore } from "~/state/wallet";
import { abbreviateAddress } from "~/utils/address";

export default function DisconnectButton() {
  const { currentWallet, removeWallet } = useWalletStore();
  const walletAddress = currentWallet?.address
    ? abbreviateAddress(currentWallet?.address)
    : null;

  return (
    <Dropdown
      key="disconnect"
      align="end"
      trigger={<IconDots />}
      items={[
        <span className="pt-2 text-sm px-2 flex flex-col gap-4">
          {/* <ConnectWalletDialog> */}
          <span className="cursor-pointer">Switch wallet</span>
          {/* </ConnectWalletDialog> */}
          <span className="">{walletAddress}</span>
        </span>,
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

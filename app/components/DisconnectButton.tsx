import { motion } from "motion/react";

import Dropdown from "~/components/ui/Dropdown";
import { IconDots } from "~/components/icons/IconDots";
import { IconDisconnect } from "~/components/icons/IconDisconnect";

import { useWalletStore } from "~/state/wallet";

export default function DisconnectButton() {
  const { removeWallet } = useWalletStore();

  return (
    <Dropdown
      align="end"
      trigger={<IconDots />}
      items={[
        <motion.span
          onClick={removeWallet}
          whileHover={{ color: "var(--color-status-error)" }}
          className="cursor-pointer flex flex-row items-center p-2 gap-8"
        >
          <span className="text-sm">Disconnect</span>
          <IconDisconnect />
        </motion.span>,
      ]}
    />
  );
}

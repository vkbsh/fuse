import { motion } from "motion/react";

import Tooltip from "~/components/ui/Tooltip";
import { IconConnect } from "~/components/ui/icons/IconConnect";
import { IconDisconnect } from "~/components/ui/icons/IconDisconnect";

import { abbreviateAddress } from "~/utils/address";
import { LSWallet, useWalletStore } from "~/state/wallet";

export default function MemberKey({
  active,
  wallet,
  permissionLabel,
}: {
  active: boolean;
  wallet: LSWallet;
  permissionLabel: string;
}) {
  const { removewalletStorage, selectWalletName } = useWalletStore();

  return (
    <div className="flex flex-col">
      <span className="text-white-60 text-sm">{permissionLabel}</span>
      <motion.span className="flex flex-row items-center py-2 gap-6 justify-between">
        <div className="w-[132px] flex flex-row gap-2 items-center">
          <img
            src={wallet.icon}
            alt={wallet.name}
            className="rounded-full w-5 h-5"
          />
          <span className="text-sm">{abbreviateAddress(wallet?.address)}</span>

          <motion.span
            className="w-3 h-3 bg-transparent rounded-full ml-auto"
            animate={{
              opacity: active ? 1 : 0,
              backgroundColor: active
                ? "var(--color-status-success)"
                : "transparent",
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="flex flex-row gap-2">
          <Tooltip text="Disconnect">
            <motion.span
              onClick={() => removewalletStorage(wallet.name)}
              className="cursor-pointer ml-auto"
              whileHover={{ color: "var(--color-status-error)" }}
            >
              <IconDisconnect />
            </motion.span>
          </Tooltip>
          <Tooltip text="Connect">
            <motion.span
              onClick={() => selectWalletName(wallet.name)}
              className="cursor-pointer ml-auto"
              whileHover={{ color: "var(--color-status-success)" }}
            >
              <IconConnect />
            </motion.span>
          </Tooltip>
        </div>
      </motion.span>
    </div>
  );
}

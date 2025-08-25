import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip";
import { CloudIcon } from "~/components/ui/icons/Cloud";
import { CloudOffIcon } from "~/components/ui/icons/CloudOff";
import { motion, AnimatePresence } from "motion/react";

import motionProps from "~/lib/motion";
import { abbreviateAddress } from "~/lib/address";
import { LSWallet, useWalletStore } from "~/state/wallet";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MemberKey({
  wallet,
  isConnected,
  closeDropdown,
  permissionLabel,
}: {
  wallet: LSWallet;
  isConnected: boolean;
  permissionLabel: string;
  closeDropdown: () => void;
}) {
  const removewalletStorage = useWalletStore(
    (state) => state.removewalletStorage,
  );
  const walletHistory = useWalletStore((state) => state.walletHistory);
  const selectWalletName = useWalletStore((state) => state.selectWalletName);

  return (
    <>
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={permissionLabel}
          className="text-sm"
          {...motionProps.memberKey.label}
        >
          {permissionLabel}
        </motion.span>
      </AnimatePresence>
      <motion.div className="flex flex-row items-center">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={wallet.address}
            className="w-32 flex flex-row gap-2 items-center text-sm"
            {...motionProps.memberKey.selectMember}
          >
            <img
              src={wallet.icon}
              alt={wallet.name}
              className="rounded-full w-5 h-5"
            />
            {abbreviateAddress(wallet?.address)}
          </motion.span>
        </AnimatePresence>
        <div className="flex flex-row gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={async () => {
                  if (walletHistory.length === 1) {
                    closeDropdown();
                  }
                  await sleep(300);
                  removewalletStorage(wallet.name);
                }}
              >
                <CloudOffIcon size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Disconnect</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={isConnected}
                onClick={() => selectWalletName(wallet.name)}
              >
                <CloudIcon size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Connect</TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </>
  );
}

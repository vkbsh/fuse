import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip";
import { CloudOff, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "~/components/ui/button";

import { abbreviateAddress } from "~/lib/address";
import { LSWallet, useWalletStore } from "~/state/wallet";

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
  const { removewalletStorage, selectWalletName } = useWalletStore();

  return (
    <div className="flex flex-col">
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={permissionLabel}
          initial={{ opacity: 0, rotateX: 90 }}
          animate={{ opacity: 1, rotateX: 0 }}
          exit={{ opacity: 0, rotateX: -90 }}
          transition={{ duration: 0.2 }}
          className="text-sm"
        >
          {permissionLabel}
          HDWA
        </motion.span>
      </AnimatePresence>
      <motion.div className="flex flex-row items-center">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={wallet.address}
            initial={{ opacity: 0, rotateX: 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: -90 }}
            transition={{ duration: 0.2 }}
            className="w-32 flex flex-row gap-2 items-center text-sm"
          >
            <img
              src={wallet.icon}
              alt={wallet.name}
              className="rounded-full w-5 h-5"
            />
            {abbreviateAddress(wallet?.address)}
          </motion.span>
        </AnimatePresence>
        <div className="flex flex-row gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  closeDropdown();
                  await new Promise((resolve) => setTimeout(resolve, 300));
                  removewalletStorage(wallet.name);
                }}
              >
                <CloudOff size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Disconnect</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                disabled={isConnected}
                onClick={() => selectWalletName(wallet.name)}
              >
                <Cloud size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Connect</TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </div>
  );
}

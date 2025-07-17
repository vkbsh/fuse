import { useState } from "react";
import { CloudIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import ConnectWalletDialog from "~/components/ConnectWalletDialog";

import { useWalletStore } from "~/state/wallet";

import {
  CLOUD_KEY_LABEL,
  RECOVERY_KEY_LABEL,
  getPermissionLabel,
} from "~/program/multisig/utils/member";

import MemberKey from "./MemberKey";
import SelectedMemberKey from "./SelectedMemberKey";

export default function MemberKeysDropdown() {
  const [isOpen, onOpenChange] = useState(false);
  const { walletHistory, walletStorage, multisigStorage } = useWalletStore();

  const memberKeys = [
    ...(walletHistory || [])
      .map((wallet) => {
        const members = multisigStorage?.account?.members || [];
        const permissionLabel = getPermissionLabel(members, wallet.address);

        return {
          ...wallet,
          permissionLabel,
          name: wallet.name,
        };
      })
      .sort((a, b) => {
        const order: { [key: string]: number } = {
          [CLOUD_KEY_LABEL]: 0,
          [RECOVERY_KEY_LABEL]: 1,
        };

        return order[a.permissionLabel] - order[b.permissionLabel];
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <SelectedMemberKey wallet={walletStorage} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" isOpen={isOpen}>
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {memberKeys.map((wallet) => {
              const active =
                wallet.address === walletStorage?.address &&
                wallet.name === walletStorage?.name;

              return (
                <motion.div
                  key={wallet.address + wallet.name}
                  transition={{ duration: 0.3 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MemberKey
                    wallet={wallet}
                    isConnected={active}
                    permissionLabel={wallet.permissionLabel}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          <ConnectWalletDialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <CloudIcon size={16} />
                <span>Connect a key</span>
              </Button>
            </DialogTrigger>
          </ConnectWalletDialog>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

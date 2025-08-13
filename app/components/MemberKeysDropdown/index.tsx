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
import { getPermissionLabel } from "~/program/multisig/utils/member";

import MemberKey from "./MemberKey";
import SelectedMemberKey from "./SelectedMemberKey";

export default function MemberKeysDropdown() {
  const [isOpen, onOpenChange] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <SelectedMemberKey />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" isOpen={isOpen}>
        <motion.div className="flex flex-col p-6">
          <MemberKeysList />
          <ConnectWalletDialog>
            <DialogTrigger asChild>
              <Button className="h-[40px] border font-medium">
                <CloudIcon size={16} />
                <span>Connect Key</span>
              </Button>
            </DialogTrigger>
          </ConnectWalletDialog>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MemberKeysList() {
  const walletHistory = useWalletStore((state) => state.walletHistory);
  const walletStorage = useWalletStore((state) => state.walletStorage);
  const multisigStorage = useWalletStore((state) => state.multisigStorage);

  const memberKeys = [
    ...(walletHistory || []).map((wallet) => {
      const members = multisigStorage?.account?.members || [];
      const permissionLabel = getPermissionLabel(members, wallet.address);

      return {
        ...wallet,
        permissionLabel,
        name: wallet.name,
      };
    }),
  ];

  return (
    <AnimatePresence initial={false}>
      {memberKeys.map((wallet) => {
        const active =
          wallet.address === walletStorage?.address &&
          wallet.name === walletStorage?.name;

        return (
          <motion.div
            layout
            key={wallet.name}
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 70 }}
            exit={{ opacity: 0, height: 0 }}
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
  );
}

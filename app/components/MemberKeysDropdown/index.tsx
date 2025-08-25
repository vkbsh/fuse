import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { CloudIcon } from "~/components/ui/icons/Cloud";
import MemberKey from "~/components/MemberKeysDropdown/MemberKey";
import SelectedMemberKey from "~/components/MemberKeysDropdown/SelectedMemberKey";

import motionProps from "~/lib/motion";
import { useWalletStore } from "~/state/wallet";
import { useDialogStore } from "~/state/dialog";
import { getPermissionLabel } from "~/program/multisig/utils/member";

export default function MemberKeysDropdown() {
  const [isOpen, onOpenChange] = useState(false);
  const walletStorage = useWalletStore((state) => state.walletStorage);
  const { onOpenChange: onConnectOpenChange } = useDialogStore("connect");

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>
        <SelectedMemberKey wallet={walletStorage} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" isOpen={isOpen}>
        <motion.div className="flex flex-col p-6">
          <MemberKeysList closeDropdown={() => onOpenChange(false)} />
          <Button
            className="h-[40px] border font-medium"
            onClick={() => onConnectOpenChange(true)}
          >
            <CloudIcon size={16} />
            <span>Connect Key</span>
          </Button>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MemberKeysList({ closeDropdown }: { closeDropdown: () => void }) {
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
            key={wallet.name}
            className="flex flex-col pb-4 gap-2"
            {...motionProps.memberKey.key}
          >
            <MemberKey
              wallet={wallet}
              isConnected={active}
              closeDropdown={closeDropdown}
              permissionLabel={wallet.permissionLabel}
            />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

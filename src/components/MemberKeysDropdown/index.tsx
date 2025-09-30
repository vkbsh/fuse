import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import Button from "~/components/ui/button";
import { CloudIcon } from "~/components/ui/icons/Cloud";
import MemberKey from "~/components/MemberKeysDropdown/MemberKey";
import SelectedMemberKey from "~/components/MemberKeysDropdown/SelectedMemberKey";

import motionProps from "~/lib/motion";
import { useDialogStore } from "~/state/dialog";
import { useWalletStore, type LSWallet } from "~/state/wallet";
import { getPermissionLabel } from "~/program/multisig/utils/member";

export default function MemberKeysDropdown() {
  const [isOpen, onOpenChange] = useState(false);
  const walletStorage = useWalletStore((s) => s.walletStorage);
  const { onOpenChange: onConnectOpenChange } = useDialogStore("connect");

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>
        <SelectedMemberKey wallet={walletStorage as LSWallet} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" isOpen={isOpen}>
        <motion.div className="flex flex-col p-4">
          <MemberKeysList closeDropdown={() => onOpenChange(false)} />
          <Button
            variant="secondary"
            className="h-[38px]"
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
  const walletHistory = useWalletStore((s) => s.walletHistory);
  const walletStorage = useWalletStore((s) => s.walletStorage);
  const multisigStorage = useWalletStore((s) => s.multisigStorage);

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

  const groupedKeys = memberKeys.reduce(
    (acc, wallet) => {
      const label = wallet.permissionLabel || "Unknown";
      if (!acc[label]) {
        acc[label] = [];
      }
      acc[label].push(wallet);
      return acc;
    },
    {} as Record<string, typeof memberKeys>,
  );

  return (
    <AnimatePresence initial={false}>
      {Object.entries(groupedKeys)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, wallets]) => (
          <motion.div layout key={label} className="flex flex-col">
            <motion.div
              className="text-sm font-medium mb-2"
              {...motionProps.memberKey.label}
            >
              {label}
            </motion.div>
            <AnimatePresence initial={false}>
              {wallets.map((wallet) => {
                const active =
                  wallet.address === walletStorage?.address &&
                  wallet.name === walletStorage?.name;

                return (
                  <motion.div
                    layout
                    key={wallet.name}
                    className="flex flex-col pb-2"
                    {...motionProps.memberKey.key}
                  >
                    <MemberKey
                      wallet={wallet}
                      isConnected={active}
                      closeDropdown={closeDropdown}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ))}
    </AnimatePresence>
  );
}

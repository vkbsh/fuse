import { CloudIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";

import {
  CLOUD_KEY_LABEL,
  RECOVERY_KEY_LABEL,
  getPermissionLabel,
} from "~/program/multisig/utils/member";

import MemberKey from "./MemberKey";
import SelectedMemberKey from "./SelectedMemberKey";

export default function MemberKeysDropdown() {
  const { onOpenChange } = useDialog("connectWallet");
  const { walletHistory, walletStorage, multisigStorage } = useWalletStore();

  const items = [
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
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => {
        const order: { [key: string]: number } = {
          [CLOUD_KEY_LABEL]: 0,
          [RECOVERY_KEY_LABEL]: 1,
        };

        return order[a.permissionLabel] - order[b.permissionLabel];
      })
      .map((wallet) => {
        const active =
          wallet.address === walletStorage?.address &&
          wallet.name === walletStorage?.name;

        return (
          <DropdownMenuItem
            key={wallet.address}
            onClick={(e) => e.stopPropagation()}
          >
            <MemberKey
              wallet={wallet}
              active={active}
              permissionLabel={wallet.permissionLabel}
            />
          </DropdownMenuItem>
        );
      }),
    <DropdownMenuItem>
      <Button onClick={() => onOpenChange(true)}>
        <span>Connect a key</span>
        <CloudIcon />
      </Button>
    </DropdownMenuItem>,
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <SelectedMemberKey wallet={walletStorage} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>{items}</DropdownMenuContent>
    </DropdownMenu>
  );
}

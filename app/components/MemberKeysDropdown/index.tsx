import Dropdown from "~/components/ui/Dropdown";
import { IconConnect } from "~/components/ui/icons/IconConnect";

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
          <div key={wallet.address} onClick={(e) => e.stopPropagation()}>
            <MemberKey
              key={wallet.address}
              wallet={wallet}
              active={active}
              permissionLabel={wallet.permissionLabel}
            />
          </div>
        );
      }),
    <button
      onClick={() => onOpenChange(true)}
      className="w-full cursor-pointer p-2 flex flex-row justify-between opacity-75 duration-500 hover:opacity-100"
    >
      <span>Connect a key</span>
      <IconConnect />
    </button>,
  ];

  return (
    <Dropdown
      align="end"
      items={items}
      trigger={<SelectedMemberKey wallet={walletStorage} />}
    />
  );
}

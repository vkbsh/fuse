import Button from "~/components/ui/Button";
import { IconCircleArrow } from "~/components/ui/icons/IconCircleArrow";

import { MemberPermissions } from "~/program/multisig/utils/parse-transaction";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";

export default function WithdrawButton() {
  const { onOpenChange } = useDialog("withdraw");
  const { multisigStorage, walletStorage } = useWalletStore();

  // TODO: Reuse in AutoReconnectWallet
  const members = multisigStorage?.account?.members || [];
  const hasAllPermissions = members.some(
    (m) =>
      m.key === walletStorage?.address &&
      m.permissions?.mask === MemberPermissions.All,
  );

  return (
    <Button
      size="sm"
      variant="bordered"
      disabled={!hasAllPermissions}
      onClick={() => onOpenChange(true)}
    >
      <span className="rounded-full w-[16px] h-[16px] flex items-center justify-center">
        <IconCircleArrow />
      </span>
      <span>Withdraw</span>
    </Button>
  );
}

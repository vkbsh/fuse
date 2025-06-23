import Button from "~/components/ui/Button";
import { IconCircleArrow } from "~/components/ui/icons/IconCircleArrow";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { hasCloudPermission } from "~/program/multisig/utils/member";

export default function WithdrawButton() {
  const { onOpenChange } = useDialog("withdraw");
  const { multisigStorage, walletStorage } = useWalletStore();

  const hasAllPermissions = hasCloudPermission(
    multisigStorage?.account?.members || [],
    walletStorage?.address,
  );

  return (
    <Button
      size="sm"
      variant="bordered"
      disabled={!hasAllPermissions}
      onClick={() => onOpenChange(true)}
      className="w-[126px]"
    >
      <span className="rounded-full w-[16px] h-[16px] flex items-center justify-center">
        <IconCircleArrow />
      </span>
      <span>Withdraw</span>
    </Button>
  );
}

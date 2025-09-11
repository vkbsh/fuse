import { toast } from "sonner";
import { type Address } from "gill";

import Coins from "~/components/Coins";
import Button from "~/components/ui/button";
import TotalBalance from "~/components/TotalBalance";
import Transactions from "~/components/Transactions";
import { CircleArrowUpIcon } from "~/components/ui/icons/CircleArrowUp";

import { useDialogStore } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { hasCloudPermission } from "~/program/multisig/utils/member";

export default function Main() {
  const { onOpenChange } = useDialogStore("withdraw");
  const walletStorage = useWalletStore((s) => s.walletStorage);
  const multisigStorage = useWalletStore((s) => s.multisigStorage);

  const multisigAddress = multisigStorage?.address as Address;
  const vaultAddress = multisigStorage?.defaultVault as Address;
  const hasAllPermissions = hasCloudPermission(
    multisigStorage?.account?.members || [],
    walletStorage?.address,
  );

  const onClick = () => {
    if (!hasAllPermissions) {
      return toast.error("Only Cloud Key allowed to withdraw funds");
    }

    onOpenChange(true);
  };

  return (
    <main className="flex-1 flex flex-col w-full h-full min-h-0 gap-10">
      <div className="flex-none">
        <TotalBalance vaultAddress={vaultAddress} />
        <Button
          variant="outline"
          onClick={onClick}
          disabled={!hasAllPermissions}
          className="h-[40px] px-4 font-medium"
        >
          <CircleArrowUpIcon />
          <span>Withdraw</span>
        </Button>
      </div>
      <div className="flex flex-1 w-full min-h-0 justify-between items-stretch">
        <div className="flex flex-1 flex-col gap-3">
          <h3 className="text-xl font-semibold">Coins</h3>
          <Coins vaultAddress={vaultAddress} />
        </div>
        <div className="flex mx-10 w-px self-stretch" />
        <div className="basis-1/7 flex flex-1 flex-col gap-3">
          <h3 className="text-xl font-semibold">Transactions</h3>
          <Transactions multisigAddress={multisigAddress} />
        </div>
      </div>
    </main>
  );
}

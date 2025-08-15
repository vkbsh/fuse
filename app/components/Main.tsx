import { Address } from "gill";
import { CircleArrowUp } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Coins from "~/components/Coins";
import { Button } from "~/components/ui/button";
import TotalBalance from "~/components/TotalBalance";
import Transactions from "~/components/Transactions";
import { DialogTrigger } from "~/components/ui/dialog";
import WithdrawDialog from "~/components/WithdrawDialog";

import { useWalletStore } from "~/state/wallet";
import { hasCloudPermission, Member } from "~/program/multisig/utils/member";

export default function Main() {
  const multisigStorage = useWalletStore((state) => state.multisigStorage);

  const multisigAddress = multisigStorage?.address as Address;
  const vaultAddress = multisigStorage?.defaultVault as Address;

  return (
    <main className="flex-1 flex flex-col w-full h-full min-h-0 gap-10">
      <div className="flex-none">
        <TotalBalance vaultAddress={vaultAddress} />
        <Withdraw members={multisigStorage?.account?.members || []} />
      </div>
      <div className="flex flex-1 w-full min-h-0 justify-between items-stretch">
        <div className="flex flex-1 min-w-0 flex-col gap-4">
          <h3 className="text-xl">Coins</h3>
          <Coins vaultAddress={vaultAddress} />
        </div>
        <div className="flex mx-10 w-px self-stretch" />
        <div className="basis-1/7 flex flex-1 min-w-0 flex-col gap-4">
          <h3 className="text-xl">Transactions</h3>
          <Transactions multisigAddress={multisigAddress} />
        </div>
      </div>
    </main>
  );
}

function Withdraw({ members }: { members: Member[] }) {
  const walletStorage = useWalletStore((state) => state.walletStorage);
  const hasAllPermissions = hasCloudPermission(members, walletStorage?.address);

  if (!hasAllPermissions) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="borderedWithIcon"
            size="borderedWithIcon"
            disabled={!hasAllPermissions}
          >
            <span className="rounded-full w-[16px] h-[16px] flex items-center justify-center">
              <CircleArrowUp />
            </span>
            <span>Withdraw</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Only Cloud Key allowed to withdraw funds
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <WithdrawDialog>
      <DialogTrigger asChild>
        <Button variant="borderedWithIcon" size="borderedWithIcon">
          <span className="rounded-full w-[16px] h-[16px] flex items-center justify-center">
            <CircleArrowUp />
          </span>
          <span>Withdraw</span>
        </Button>
      </DialogTrigger>
    </WithdrawDialog>
  );
}

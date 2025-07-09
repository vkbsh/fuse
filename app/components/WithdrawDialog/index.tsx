import { Address } from "gill";
import { CircleArrowDown } from "lucide-react";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";
import { useMultisigAccount } from "~/hooks/resources";

import Dialog from "~/components/Dialog";
import { Button } from "~/components/ui/button";
import { hasCloudPermission } from "~/program/multisig/utils/member";

import Review from "./Review";
import EnterAmount from "./EnterAmount";
import ChooseWallet from "./ChooseWallet";

export default function WithdrawDialog() {
  const { onOpenChange } = useDialog("withdraw");
  const { walletStorage, multisigStorage } = useWalletStore();

  const multisigAddress = multisigStorage?.address as Address;
  const vaultAddress = multisigStorage?.defaultVault as Address;

  const { data: multisigAccount } = useMultisigAccount(multisigAddress);
  const transactionIndex = Number(multisigAccount?.transactionIndex);

  const hasAllPermissions = hasCloudPermission(
    multisigStorage?.account?.members || [],
    walletStorage?.address,
  );

  return (
    <Dialog
      name="withdraw"
      title="Withdraw"
      trigger={
        <Button
          className="w-[127px]"
          disabled={!hasAllPermissions}
          onClick={() => onOpenChange(true)}
        >
          <span className="rounded-full w-[16px] h-[16px] flex items-center justify-center">
            <CircleArrowDown />
          </span>
          <span>Withdraw</span>
        </Button>
      }
    >
      {transactionIndex && walletStorage && (
        <Withdraw
          onOpenChange={onOpenChange}
          vaultAddress={vaultAddress}
          walletName={walletStorage.name}
          multisigAddress={multisigAddress}
          transactionIndex={transactionIndex}
        />
      )}
    </Dialog>
  );
}

function Withdraw({
  walletName,
  vaultAddress,
  onOpenChange,
  multisigAddress,
  transactionIndex,
}: {
  walletName: string;
  vaultAddress: Address;
  multisigAddress: Address;
  transactionIndex: number;
  onOpenChange: (open: boolean) => void;
}) {
  const wallet = useWalletByName(walletName);
  const walletAccount = wallet?.accounts[0];

  if (!walletAccount) {
    return null;
  }

  return (
    <>
      <ChooseWallet vaultAddress={vaultAddress} />
      <EnterAmount vaultAddress={vaultAddress} />
      <Review
        onClose={() => onOpenChange(false)}
        vaultAddress={vaultAddress}
        walletAccount={walletAccount}
        multisigAddress={multisigAddress}
        transactionIndex={transactionIndex}
      />
    </>
  );
}

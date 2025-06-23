import { Address } from "gill";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";
import { useMultisigAccount } from "~/hooks/resources";

import Dialog from "~/components/ui/Dialog";
import Review from "./Review";
import EnterAmount from "./EnterAmount";
import ChooseWallet from "./ChooseWallet";

export default function WithdrawDialog() {
  const { walletStorage } = useWalletStore();
  const { multisigStorage } = useWalletStore();
  const { isOpen, onOpenChange } = useDialog("withdraw");

  const multisigAddress = multisigStorage?.address as Address;
  const vaultAddress = multisigStorage?.defaultVault as Address;

  const { data: multisigAccount } = useMultisigAccount(multisigAddress);
  const transactionIndex = Number(multisigAccount?.transactionIndex);

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
        <h3 className="text-xl font-bold text-center">Withdraw</h3>
        {transactionIndex && walletStorage && (
          <Withdraw
            onOpenChange={onOpenChange}
            vaultAddress={vaultAddress}
            walletName={walletStorage.name}
            multisigAddress={multisigAddress}
            transactionIndex={transactionIndex}
          />
        )}
      </div>
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
        walletAccount={walletAccount}
        multisigAddress={multisigAddress}
        transactionIndex={transactionIndex}
      />
    </>
  );
}

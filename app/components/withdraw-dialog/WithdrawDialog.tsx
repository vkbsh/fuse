import { Address } from "gill";

import Dialog from "~/components/ui/Dialog";
import Review from "~/components/withdraw-dialog/Review";
import EnterAmount from "~/components/withdraw-dialog/EnterAmount";
import ChooseWallet from "~/components/withdraw-dialog/ChooseWallet";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";
import { useMultisigAccount } from "~/hooks/resources";

export default function WithdrawDialog() {
  const { walletStorage } = useWalletStore();
  const { multisigStorage } = useWalletStore();
  const { isOpen, onOpenChange } = useDialog("withdraw");

  const multisigAddress = multisigStorage?.address as Address;
  const vaultAddress = multisigStorage?.defaultVault as Address;

  const { data: multisigAccount } = useMultisigAccount(multisigAddress);
  const walletAccount = useWalletByName(walletStorage?.name as string)
    ?.accounts?.[0];

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
        <h3 className="text-xl font-bold text-center">Withdraw</h3>
        {walletAccount && (
          <>
            <ChooseWallet vaultAddress={vaultAddress} />
            <EnterAmount vaultAddress={vaultAddress} />
            <Review
              vaultAddress={vaultAddress}
              walletAccount={walletAccount}
              multisigAddress={multisigAddress}
              onClose={() => onOpenChange(false)}
              transactionIndex={Number(multisigAccount?.transactionIndex)}
            />
          </>
        )}
      </div>
    </Dialog>
  );
}

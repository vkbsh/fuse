import Dialog from "~/components/ui/Dialog";

import Review from "./Review";
import EnterAmount from "./EnterAmount";
import ChooseWallet from "./ChooseWallet";

import { useWalletByName } from "~/hooks/wallet";
import { useMultisigAccount } from "~/hooks/resources";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";

import { Address } from "~/model/web3js";

export default function WithdrawDialog() {
  const { walletStorage } = useWalletStore();
  const { isOpen, onOpenChange } = useDialog("withdraw");

  const { multisigStorage } = useWalletStore();
  const { data: multisigAccount } = useMultisigAccount(
    multisigStorage?.address as Address,
  );

  const vaultAddress = multisigStorage?.defaultVault as Address;
  const transactionIndex = Number(multisigAccount?.transactionIndex);
  const multisigAddress = multisigStorage?.address as Address;
  const walletAccount = useWalletByName(walletStorage?.name as string)
    ?.accounts[0];

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
              transactionIndex={transactionIndex}
              onClose={() => onOpenChange(false)}
            />
          </>
        )}
      </div>
    </Dialog>
  );
}

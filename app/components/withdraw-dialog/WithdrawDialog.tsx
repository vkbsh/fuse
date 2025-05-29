import { useState } from "react";

import Dialog from "~/components/ui/Dialog";

import Review from "./Review";
import EnterAmount from "./EnterAmount";
import ChooseWallet from "./ChooseWallet";

import { useDialog } from "~/state/dialog";
import { useMultisigAccount } from "~/hooks/resources";
import { useWalletByName } from "~/hooks/wallet";
import { useWalletStore } from "~/state/wallet";
import { UiWalletAccount } from "@wallet-standard/react";
import { Address } from "~/model/web3js";

export default function WithdrawDialog() {
  const { isOpen, onOpenChange } = useDialog("withdraw");
  const { storageWallet } = useWalletStore();
  const walletAccount = useWalletByName(storageWallet?.name as string)
    ?.accounts[0];

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
        {walletAccount && <Steps walletAccount={walletAccount} />}
      </div>
    </Dialog>
  );
}

function Steps({ walletAccount }: { walletAccount: UiWalletAccount }) {
  const { onOpenChange } = useDialog("withdraw");
  const [currentStep, setCurrentStep] = useState(1);
  const { storageMultisigWallet } = useWalletStore();
  const { data: multisigAccount } = useMultisigAccount(
    storageMultisigWallet?.address as Address,
  );

  const onClose = () => onOpenChange(false);
  const nextStep = () => setCurrentStep((step) => (step < 3 ? step + 1 : step));
  const prevStep = () => setCurrentStep((step) => (step > 1 ? step - 1 : step));

  switch (currentStep) {
    default:
      return null;
    case 1:
      return <ChooseWallet onClose={onClose} nextStep={nextStep} />;
    case 2:
      return <EnterAmount prevStep={prevStep} nextStep={nextStep} />;
    case 3:
      return (
        <Review
          onClose={onClose}
          prevStep={prevStep}
          walletAccount={walletAccount}
          transactionIndex={Number(multisigAccount?.transactionIndex)}
        />
      );
  }
}

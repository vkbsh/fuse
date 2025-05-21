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
import { Wallet } from "~/model/wallet";
import { Address } from "~/model/web3js";

export default function WithdrawDialog() {
  const { isOpen, onOpenChange, data } = useDialog("withdraw");
  const { storageWallet, storageMultisigWallet } = useWalletStore();
  const walletAccount = useWalletByName(storageWallet?.name as string)
    ?.accounts[0];
  const { data: multisig } = useMultisigAccount(
    storageMultisigWallet?.address as Address,
  );

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
        <Steps
          walletAccount={walletAccount}
          onClose={() => onOpenChange(false)}
          multisigWallet={multisig}
        />
      </div>
    </Dialog>
  );
}

function Steps({
  onClose,
  walletAccount,
  multisigWallet,
}: {
  onClose: () => void;
  walletAccount: UiWalletAccount;
  multisigWallet: Wallet;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => setCurrentStep((step) => (step < 3 ? step + 1 : step));
  const prevStep = () => setCurrentStep((step) => (step > 1 ? step - 1 : step));

  switch (currentStep) {
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
          multisigWallet={multisigWallet}
        />
      );

    default:
      return null;
  }
}

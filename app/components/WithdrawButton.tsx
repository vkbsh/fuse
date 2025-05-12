import { useState } from "react";
import { UiWalletAccount } from "@wallet-standard/react";

import Button from "~/components/ui/Button";
import Dialog from "~/components/ui/Dialog";
import Review from "~/components/withdraw-dialog/Review";
import EnterAmount from "~/components/withdraw-dialog/EnterAmount";
import ChooseWallet from "~/components/withdraw-dialog/ChooseWallet";
import { IconCircleArrow } from "~/components/icons/IconCircleArrow";

import { useWithdrawStore } from "~/state/withdraw";
import { useWalletStore } from "~/state/wallet";

export default function WithdrawDialog({
  walletAccount,
}: {
  walletAccount: UiWalletAccount;
}) {
  const { reset } = useWithdrawStore();
  const [isOpen, setOpen] = useState(false);
  const { currentMultisigWallet, currentWallet } = useWalletStore();

  const isDisabled = currentMultisigWallet?.account?.members.some(
    (m) => m.key === currentWallet?.address && m.permissions.mask !== 7,
  );

  // TODO: Add Tooltip with required permissions

  if (isDisabled) {
    return (
      <Button size="sm" variant="bordered" disabled={isDisabled}>
        <span className="rounded-full w-[16px] h-[16px] flex items-center justify-center">
          <IconCircleArrow />
        </span>
        <span>Withdraw</span>
      </Button>
    );
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm" variant="bordered">
          <span className="rounded-full w-[16px] h-[16px] flex items-center justify-center">
            <IconCircleArrow />
          </span>
          <span>Withdraw</span>
        </Button>
      }
    >
      <Steps walletAccount={walletAccount} onClose={() => setOpen(false)} />
    </Dialog>
  );
}

function Steps({
  onClose,
  walletAccount,
}: {
  onClose: () => void;
  walletAccount: UiWalletAccount;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => setCurrentStep((step) => (step < 3 ? step + 1 : step));
  const prevStep = () => setCurrentStep((step) => (step > 1 ? step - 1 : step));

  return (
    <div className="flex flex-col gap-6 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
      {currentStep === 1 && (
        <ChooseWallet onClose={onClose} nextStep={nextStep} />
      )}
      {currentStep === 2 && (
        <EnterAmount prevStep={prevStep} nextStep={nextStep} />
      )}
      {currentStep === 3 && (
        <Review
          onClose={onClose}
          prevStep={prevStep}
          walletAccount={walletAccount}
        />
      )}
    </div>
  );
}

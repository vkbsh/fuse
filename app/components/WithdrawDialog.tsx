import { useState } from "react";

import Button from "~/components/ui/Button";
import Dialog from "~/components/ui/Dialog";
import Review from "~/components/withdraw-dialog/Review";
import EnterAmount from "~/components/withdraw-dialog/EnterAmount";
import ChooseWallet from "~/components/withdraw-dialog/ChooseWallet";
import { IconCircleArrow } from "~/components/icons/IconCircleArrow";

import { useWithdrawStore } from "~/state/withdraw";
import { AnimatePresence, motion } from "motion/react";
import { useWalletStore } from "~/state/wallet";

export default function WithdrawDialog() {
  const { reset } = useWithdrawStore();
  const [isOpen, setOpen] = useState(false);
  const { currentMultisigWallet, currentWallet } = useWalletStore();

  // Initiate only: mask = 1
  // Vote only: mask = 2
  // Execute only: mask = 4
  // Initiate + Vote: mask = 3
  // Initiate + Execute: mask = 5
  // Vote + Execute: mask = 6
  // All permissions: mask = 7
  const isDisabled = currentMultisigWallet?.account?.members.some(
    (m) =>
      m.key === currentWallet?.address &&
      m.permissions.mask !== 1 &&
      m.permissions.mask !== 3 &&
      m.permissions.mask !== 5 &&
      m.permissions.mask !== 7,
  );

  // TODO: Add Tooltip with required permissions
  // TODO: show list of accounts from currentMultisigWallet?.account?.members

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
      <Steps onClose={() => setOpen(false)} />
    </Dialog>
  );
}

function Steps({ onClose }: { onClose: () => void }) {
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
      {currentStep === 3 && <Review onClose={onClose} prevStep={prevStep} />}
    </div>
  );
}

import { useState } from "react";

import Button from "~/components/ui/Button";
import Dialog from "~/components/ui/Dialog";
import Review from "~/components/withdraw-dialog/Review";
import EnterAmount from "~/components/withdraw-dialog/EnterAmount";
import ChooseWallet from "~/components/withdraw-dialog/ChooseWallet";
import { IconCircleArrow } from "~/components/icons/IconCircleArrow";

import { useWithdrawStore } from "~/state/withdraw";
import { AnimatePresence, motion } from "motion/react";

export default function WithdrawButton() {
  const [isModalOpen, setisModalOpen] = useState(false);

  return (
    <Dialog
      isOpen={isModalOpen}
      trigger={
        <Button
          size="sm"
          variant="bordered"
          onClick={() => setisModalOpen(true)}
        >
          <span className="rounded-full w-[16px] h-[16px] flex items-center justify-center">
            <IconCircleArrow />
          </span>
          <span>Withdraw</span>
        </Button>
      }
      close={() => setisModalOpen(false)}
    >
      <Steps onClose={() => setisModalOpen(false)} />
    </Dialog>
  );
}

function Steps({ onClose }: { onClose: () => void }) {
  const { reset } = useWithdrawStore();
  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => setCurrentStep((prev) => (prev < 3 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleClose = () => {
    // reset();
    onClose();
  };

  return (
    <div className="flex flex-col gap-6 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
      <AnimatePresence mode="wait">
        <motion.div
          layout
          key={currentStep}
          initial={{ backdropFilter: "blur(10px)", opacity: 0, height: 300 }}
          animate={{ backdropFilter: "blur(0px)", opacity: 1, height: "auto" }}
          exit={{ backdropFilter: "blur(10px)", opacity: 0, height: 300 }}
          transition={{ duration: 0.1 }}
          className="flex flex-col gap-6 overflow-hidden"
        >
          <Step
            nextStep={nextStep}
            prevStep={prevStep}
            onClose={handleClose}
            currentStep={currentStep}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Step({
  onClose,
  prevStep,
  nextStep,
  currentStep,
}: {
  onClose: () => void;
  prevStep: () => void;
  nextStep: () => void;
  currentStep: number;
}) {
  switch (currentStep) {
    case 1:
      return <ChooseWallet onClose={onClose} nextStep={nextStep} />;
    case 2:
      return <EnterAmount prevStep={prevStep} nextStep={nextStep} />;
    case 3:
      return <Review onClose={onClose} prevStep={prevStep} />;
  }
}

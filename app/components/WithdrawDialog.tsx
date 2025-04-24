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
  const { reset } = useWithdrawStore();

  return (
    <Dialog
      trigger={
        <Button size="sm" variant="bordered">
          <span className="rounded-full w-[16px] h-[16px] flex items-center justify-center">
            <IconCircleArrow />
          </span>
          <span>Withdraw</span>
        </Button>
      }
    >
      <Steps />
    </Dialog>
  );
}

function Steps() {
  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => setCurrentStep((step) => (step < 3 ? step + 1 : step));
  const prevStep = () => setCurrentStep((step) => (step > 1 ? step - 1 : step));

  // TODO: fix motion (height)

  return (
    <div className="flex flex-col gap-6 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
      <AnimatePresence mode="wait">
        <motion.div
          layout
          transition={{ duration: 0.1 }}
          initial={{ backdropFilter: "blur(10px)", opacity: 0, height: 300 }}
          animate={{ backdropFilter: "blur(0px)", opacity: 1, height: "auto" }}
          exit={{ backdropFilter: "blur(10px)", opacity: 0, height: 300 }}
          className="flex flex-col gap-6 overflow-hidden"
        >
          {currentStep === 1 && <ChooseWallet nextStep={nextStep} />}
          {currentStep === 2 && (
            <EnterAmount prevStep={prevStep} nextStep={nextStep} />
          )}
          {currentStep === 3 && <Review prevStep={prevStep} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

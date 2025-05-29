import { useState } from "react";
import { motion } from "motion/react";
import { useDebounce } from "@uidotdev/usehooks";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import SelectToken from "~/components/SelectToken";

import { useTokenPrice } from "~/hooks/resources";
import { useWithdrawStore } from "~/state/withdraw";

import { Address } from "~/model/web3js";
import { getRoundedToken, getRoundedSOL } from "~/utils/amount";
import { useWalletStore } from "~/state/wallet";

const EnterAmount = ({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) => {
  const [error, setError] = useState("");
  const { set, amount, token } = useWithdrawStore();
  const [value, setValue] = useState(amount || "0");
  const { storageMultisigWallet } = useWalletStore();
  const debounceValue = useDebounce(value, 700);

  const { data: price } = useTokenPrice(token?.mint as Address) || {};
  const calculatedAmount = Number(debounceValue) * price;

  const tokenAmount = Number(token?.amount) || 0;
  const maxAmount =
    token?.symbol?.toLocaleLowerCase() === "sol"
      ? getRoundedSOL(tokenAmount)
      : getRoundedToken(tokenAmount);

  const validateInput = (value: string) => {
    const regex = /^\d+([.,]\d*)?$/;

    if (!regex.test(value)) {
      return value.slice(0, -1).replace(",", ".");
    }

    return value.replace(",", ".");
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validatedValue = validateInput(e.target.value);

    setError("");
    setValue(validatedValue);
    set("amount", Number(validatedValue));
  };

  const setMax = () => {
    const max = Number(token?.amount);
    if (!max) return;

    set("amount", max);
    setValue(token?.amount + "");
  };

  const validateAmount = () => {
    if (Number(value) > Number(token?.amount)) {
      return "Invalid amount (not enough balance)";
    }

    if (Number(value) < 1 / 10 ** (token?.decimals || 6)) {
      return "Invalid amount (too small)";
    }

    return "";
  };

  const handleNextStep = () => {
    const error = validateAmount();

    if (error) {
      return setError(error);
    } else {
      return nextStep();
    }
  };

  return (
    <>
      <h3 className="text-center font-bold text-xl">Enter Amount</h3>
      <SelectToken
        vaultAddress={storageMultisigWallet?.defaultVault as Address}
      />
      <div className="relative flex flex-row gap-4 items-center justify-between">
        <label htmlFor="amount" className="cursor-pointer flex flex-row w-full">
          <div className="relative overflow-visible flex flex-row gap-1.5 items-center justify-between">
            <Input
              id="amount"
              value={value}
              onChange={onChange}
              className="font-bold text-5xl"
            />
          </div>
        </label>
        <Button onClick={setMax} size="md" variant="max">
          MAX
        </Button>
        {error && (
          <motion.span
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: 10,
            }}
            className="absolute w-full text-xs text-status-error -bottom-6"
          >
            {error}
          </motion.span>
        )}
      </div>
      <div className="flex flex-row gap-2 items-center justify-between mt-2 text-white/60">
        <motion.span
          key={calculatedAmount}
          initial={{
            scale: 0.9,
            opacity: 0.8,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            filter: !calculatedAmount ? "blur(2px)" : "blur(0px)",
          }}
          transition={{
            duration: 0.6,
          }}
          className="text-base flex"
        >
          ${calculatedAmount?.toFixed(2)}{" "}
        </motion.span>
        <span>{maxAmount}</span>
      </div>
      <div className="flex flex-row gap-2 justify-center">
        <Button size="md" onClick={prevStep} variant="cancel">
          Back
        </Button>
        <Button size="md" onClick={handleNextStep} variant="secondary">
          Next
        </Button>
      </div>
    </>
  );
};

export default EnterAmount;

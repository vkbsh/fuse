import { address } from "gill";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import SelectToken, { Token } from "~/components/SelectToken";

import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";
import { useWalletTokens, fetchTokenPrice } from "~/state/totalBalance";

import { Address } from "~/model/web3js";
import { getRoundedCoin, getRoundedSOL } from "~/utils/amount";

// TODO: add debaunce for calculatedAmount
// TODO: validation for , in input value (now is NaN with , and number with .)
const EnterAmount = ({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) => {
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { set, amount, token } = useWithdrawStore();
  const [value, setValue] = useState(amount || "0");
  const { currentMultisigWallet } = useWalletStore();
  const { coins } = useWalletTokens({
    address: address(currentMultisigWallet?.defaultVault as Address),
  });

  const selectedToken = token || coins[0];

  const calculatedAmount = Number(value) * 200; // TODO: fetch price from Jupiter
  const minAmount = 0.0001; // TODO: calculate correct min
  const maxAmount =
    token?.symbol?.toLocaleLowerCase() === "sol"
      ? getRoundedSOL(selectedToken?.amount)
      : getRoundedCoin(selectedToken?.amount);

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
    set("amount", Number(selectedToken?.amount));
    setValue(selectedToken?.amount + "");
  };

  const onFocus = () => {
    if (inputRef.current) {
      const length = inputRef.current.value.length;

      inputRef.current.setSelectionRange(length, length);
      inputRef.current.focus();
    }
  };

  const onBlur = () => {};

  const validateAmount = () => {
    if (Number(value) > Number(selectedToken?.amount)) {
      return "Invalid amount (not enough balance)";
    }
    if (Number(value) < minAmount) {
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

  useEffect(() => {
    set("token", selectedToken);
  }, [selectedToken]);

  return (
    <>
      <h3 className="text-center font-bold text-xl">Enter Amount</h3>
      <SelectToken
        items={coins}
        selected={selectedToken}
        onSelect={(token) => set("token", token)}
      />
      <div className="relative flex flex-row gap-4 items-center justify-between">
        <label htmlFor="amount" className="cursor-pointer flex flex-row w-full">
          <div className="relative overflow-visible flex flex-row gap-1.5 items-center justify-between">
            <Input
              id="amount"
              value={value}
              ref={inputRef}
              onBlur={onBlur}
              onFocus={onFocus}
              onChange={onChange}
              className="font-bold text-5xl"
            />
          </div>
        </label>
        <Button onClick={setMax} variant="bordered">
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
      <div className="flex flex-row gap-2 items-center justify-between mt-2">
        <motion.span
          key={calculatedAmount}
          animate={{ opacity: [0, 1] }}
          transition={{
            duration: 0.3,
          }}
          className="text-base text-white"
        >
          ${calculatedAmount.toFixed(2)}{" "}
        </motion.span>
        <span>{maxAmount}</span>
      </div>
      <div className="flex flex-row gap-2 justify-center">
        <Button size="md" onClick={prevStep} variant="secondary">
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

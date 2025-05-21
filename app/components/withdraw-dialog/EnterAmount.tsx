import { address } from "gill";
import { motion } from "motion/react";
import { useDebounce } from "@uidotdev/usehooks";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import SelectToken from "~/components/SelectToken";

import { useWalletStore } from "~/state/wallet";
import { useBalance } from "~/hooks/resources";
import { useWithdrawStore } from "~/state/withdraw";
import { fetchTokenPrice, fetchTokenMeta } from "~/service/token";

import { Address } from "~/model/web3js";
import { getRoundedCoin, getRoundedSOL } from "~/utils/amount";

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
  const { storageMultisigWallet } = useWalletStore();
  const multisigAddress = address(
    storageMultisigWallet?.defaultVault as Address,
  );
  const { data, isLoading } = useBalance(
    storageMultisigWallet?.defaultVault as Address,
  );

  const coins = [];

  const selectedToken = token || coins[0];
  const debounceValue = useDebounce(value, 700);

  const { data: calculatedAmount = 0 } = useQuery({
    enabled: Number(debounceValue) > 0,
    queryKey: ["tokenPrice", debounceValue],
    queryFn: async () => {
      const tokenPrice = await fetchTokenPrice(token?.mint as string);

      return Number(debounceValue) * tokenPrice;
    },
  });

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
    if (Number(value) < 0.0000000001) {
      // TODO: check min amount
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

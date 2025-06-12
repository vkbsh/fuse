import { Address } from "gill";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import SelectToken from "~/components/SelectToken";

import { useTokenPrice } from "~/hooks/resources";
import { useWithdrawStore } from "~/state/withdraw";

import { getRoundedToken, getRoundedSOL } from "~/utils/amount";

const EnterAmount = ({ vaultAddress }: { vaultAddress: Address }) => {
  const [error, setError] = useState("");
  const { set, amount, token } = useWithdrawStore();
  const [value, setValue] = useState(amount ? amount + "" : "");
  const debounceValue = useDebounce(value, 700);

  const { data: price } = useTokenPrice(token?.mint as Address) || {};
  const calculatedAmount = !error
    ? Number(debounceValue) * Number(price || 0)
    : 0;

  const tokenAmount = Number(token?.amount);
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

  useEffect(() => {
    setError(validateAmount());
  }, [value]);

  return (
    <>
      <div className="relative flex flex-row gap-4 items-center justify-between">
        <SelectToken vaultAddress={vaultAddress} />
        <label htmlFor="amount" className="cursor-pointer flex flex-row w-full">
          <div className="relative overflow-visible flex flex-row gap-1.5 items-center justify-between border rounded-2xl border-white/40 px-4 py-1">
            <Input
              id="amount"
              value={value}
              onChange={onChange}
              className="text-2xl"
              placeholder="0.00"
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
    </>
  );
};

export default EnterAmount;

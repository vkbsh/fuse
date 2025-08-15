import { Address } from "gill";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { motion, AnimatePresence } from "motion/react";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import { TokenData, useTokenPrice } from "~/hooks/resources";
import { getRoundedToken, getRoundedSOL } from "~/lib/amount";

const EnterAmount = ({
  token,
  error,
  amount,
  setAmount,
  removeError,
}: {
  error?: string;
  amount: number | null;
  token: TokenData | null;
  setAmount: (amount: number) => void;
  removeError: (key: string) => void;
}) => {
  const [value, setValue] = useState(amount ? amount + "" : "");
  const debounceValue = useDebounce(value, 700);

  const { data: price } = useTokenPrice(token?.mint as Address) || {};
  const calculatedAmount = !error
    ? Number(debounceValue) * Number(price || 0)
    : 0;

  const calculatedAmountLabel = `$ ${calculatedAmount?.toFixed(2)}`;

  const tokenAmount = Number(token?.amount);
  const maxAmount =
    token?.symbol?.toLocaleLowerCase() === "sol"
      ? getRoundedSOL(tokenAmount)
      : getRoundedToken(tokenAmount);
  const maxAmountLabel = `${maxAmount}`;

  const parseInput = (value: string) => {
    const regex = /^(0|[1-9]\d*)(\.\d*)?$/;

    if (!regex.test(value)) {
      return value.slice(0, -1).replace(",", ".");
    }

    return value.replace(",", ".");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validatedValue = parseInput(e.target.value);

    setValue(validatedValue);
    setAmount(Number(validatedValue));
  };

  const setMax = () => {
    if (!tokenAmount) return;

    setValue(tokenAmount + "");
    setAmount(tokenAmount);
  };

  return (
    <>
      <div className="flex flex-row gap-4 items-center justify-between">
        <Input
          value={value}
          error={error}
          placeholder={`0.00`}
          onChange={handleChange}
          className="border-0 bg-transparent font-bold text-5xl h-[44px] indent-0 rounded-none"
          onFocus={() => removeError("amount")}
        />
        <Button variant="secondary" className="px-5 h-11" onClick={setMax}>
          MAX
        </Button>
      </div>
      <motion.div className="flex flex-row items-center justify-between text-sm cursor-default">
        <motion.span
          layout
          key={calculatedAmountLabel}
          transition={{ duration: 0.3 }}
          initial={{ filter: "blur(6px)" }}
          animate={{ filter: "blur(0px)" }}
          exit={{ filter: "blur(6px)" }}
          className="text-placeholder"
        >
          {calculatedAmountLabel}
        </motion.span>
        <motion.span
          layout
          key={maxAmountLabel}
          transition={{ duration: 0.3 }}
          initial={{ filter: "blur(6px)" }}
          animate={{ filter: "blur(0px)" }}
          exit={{ filter: "blur(6px)" }}
          className="text-placeholder"
        >
          {maxAmountLabel}
        </motion.span>
      </motion.div>
    </>
  );
};

export default EnterAmount;

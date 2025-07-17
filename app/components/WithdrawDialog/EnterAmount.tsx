import { Address } from "gill";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import Field from "~/components/Field";
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

  const tokenAmount = Number(token?.amount);
  const maxAmountLabel =
    token?.symbol?.toLocaleLowerCase() === "sol"
      ? getRoundedSOL(tokenAmount)
      : getRoundedToken(tokenAmount);

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
      <div className="flex flex-row gap-4 items-end justify-between">
        <Field
          value={value}
          error={error}
          label="Amount"
          placeholder={`0.00 ${token?.symbol}`}
          onChange={handleChange}
          className="w-full  outline-0"
          onFocus={() => removeError("amount")}
        />
        <Button variant="secondary" onClick={setMax}>
          MAX
        </Button>
      </div>
      <div className="flex flex-row items-center justify-between text-sm cursor-default">
        <span>${calculatedAmount?.toFixed(2)}</span>
        <span>
          {maxAmountLabel} {token?.symbol}
        </span>
      </div>
    </>
  );
};

export default EnterAmount;

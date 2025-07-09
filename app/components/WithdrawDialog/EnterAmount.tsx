import { Address } from "gill";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import { Button } from "~/components/ui/button";
import SelectToken from "~/components/SelectToken";

import { useTokenPrice } from "~/hooks/resources";
import { useWithdrawStore } from "~/state/withdraw";
import { getRoundedToken, getRoundedSOL } from "~/lib/amount";

const EnterAmount = ({ vaultAddress }: { vaultAddress: Address }) => {
  const { set, amount, token, removeError, errors } = useWithdrawStore();
  const [value, setValue] = useState(amount ? amount + "" : "");
  const debounceValue = useDebounce(value, 700);

  const { data: price } = useTokenPrice(token?.mint as Address) || {};
  const calculatedAmount = !errors?.amount
    ? Number(debounceValue) * Number(price || 0)
    : 0;

  const tokenAmount = Number(token?.amount);
  const maxAmountLabel =
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

  const handleFocus = () => removeError("amount");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validatedValue = validateInput(e.target.value);

    setValue(validatedValue);
  };

  const setMax = () => {
    if (!tokenAmount) return;

    setValue(tokenAmount + "");
  };

  useEffect(() => {
    removeError("amount");

    if (value) {
      set("amount", Number(value));
    }
  }, [value]);

  return (
    <>
      <div className="relative flex flex-row gap-4 items-center justify-between">
        <SelectToken vaultAddress={vaultAddress} />
        <label htmlFor="amount" className="cursor-pointer flex flex-row w-full">
          <div className="relative overflow-visible flex flex-row gap-1.5 items-center justify-between border rounded-2xl border-white-40 px-4 py-1">
            <input
              value={value}
              autoComplete="off"
              placeholder="0.00"
              onFocus={handleFocus}
              onChange={handleChange}
              className="w-full text-2xl outline-0"
            />
            {errors?.amount && (
              <motion.div
                key="error-amount"
                className="absolute w-full text-xs text-status-error -bottom-6 text-nowrap"
              >
                {errors?.amount}
              </motion.div>
            )}
          </div>
        </label>
        <Button onClick={setMax}>MAX</Button>
      </div>
      <div className="flex flex-row gap-2 items-center justify-between mt-2 text-white-60">
        <div className="text-base flex">
          $<span>{calculatedAmount?.toFixed(2)}</span>
        </div>
        <span>{maxAmountLabel}</span>
      </div>
    </>
  );
};

export default EnterAmount;

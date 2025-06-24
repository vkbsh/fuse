import { Address } from "gill";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import SelectToken from "~/components/SelectToken";
import Animate from "~/components/animated/Animate";

import { useTokenPrice } from "~/hooks/resources";
import { useWithdrawStore } from "~/state/withdraw";
import { getRoundedToken, getRoundedSOL } from "~/utils/amount";

const EnterAmount = ({ vaultAddress }: { vaultAddress: Address }) => {
  const { set, amount, token, addError, removeError, errors } =
    useWithdrawStore();
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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validatedValue = validateInput(e.target.value);

    removeError("amount");
    setValue(validatedValue);
  };

  const setMax = () => {
    const max = Number(token?.amount);
    if (!max) return;

    setValue(token?.amount + "");
  };

  const validateAmount = () => {
    let error = "";

    if (Number(value) > Number(token?.amount)) {
      error = "Invalid amount (not enough balance)";
    }

    if (Number(value) < 1 / 10 ** Number(token?.decimals) || 0) {
      error = "Invalid amount (too small)";
    }

    if (Number(value) === 0) {
      error = "Invalid amount (zero)";
    }

    if (error) {
      addError("amount", error);
    } else {
      set("amount", Number(value));
      removeError("amount");
    }
  };

  return (
    <>
      <div className="relative flex flex-row gap-4 items-center justify-between">
        <SelectToken vaultAddress={vaultAddress} />
        <label htmlFor="amount" className="cursor-pointer flex flex-row w-full">
          <div className="relative overflow-visible flex flex-row gap-1.5 items-center justify-between border rounded-2xl border-white-40 px-4 py-1">
            <Input
              id="amount"
              value={value}
              onChange={onChange}
              onBlur={validateAmount}
              className="text-2xl"
              placeholder="0.00"
              error={!!errors?.amount}
            />
            {errors?.amount && (
              <Animate
                variant="slideDown"
                className="absolute w-full text-xs text-status-error -bottom-6 text-nowrap"
              >
                {errors?.amount}
              </Animate>
            )}
          </div>
        </label>
        <Button onClick={setMax} size="md" variant="max">
          MAX
        </Button>
      </div>
      <div className="flex flex-row gap-2 items-center justify-between mt-2 text-white-60">
        <span className="text-base flex">${calculatedAmount?.toFixed(2)} </span>
        <span>{maxAmountLabel}</span>
      </div>
    </>
  );
};

export default EnterAmount;

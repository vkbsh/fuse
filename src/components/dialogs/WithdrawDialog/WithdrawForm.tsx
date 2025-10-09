import { useState, type ChangeEvent } from "react";
import { type Address, assertIsAddress } from "gill";
import { type UiWalletAccount } from "@wallet-standard/react";

import { roundToken } from "~/lib/amount";
import SelectTokenDropdown from "~/components/SelectTokenDropdown";
import { type TokenData } from "~/hooks/resources";

import PriceToken from "./TokenPrice";
import InputAmount from "./InputAmount";
import InputAddress from "./InputAddress";
import InitiateButton from "./InitiateButton";

const parseAmountInput = (value: string) => {
  const regex = /^(0|[1-9]\d*)(\.[0-9]*)?$/;

  if (!regex.test(value)) {
    return value.slice(0, -1).replace(",", ".");
  }

  return value.replace(",", ".");
};

export default function WithdrawForm({
  tokens,
  initToken,
  vaultAddress,
  onCloseDialog,
  walletAccount,
  multisigAddress,
  transactionIndex,
}: {
  initToken: TokenData;
  tokens: TokenData[];
  vaultAddress: Address;
  transactionIndex: number;
  multisigAddress: Address;
  onCloseDialog: () => void;
  walletAccount: UiWalletAccount | undefined;
}) {
  const [valueAmount, setValueAmount] = useState("");
  const [valueAddress, setValueAddress] = useState("");

  const [errorAmount, setErrorAmount] = useState<string | undefined>(undefined);
  const [errorAddress, setErrorAddress] = useState<string | undefined>(
    undefined,
  );
  const [token, setToken] = useState<TokenData | null>(
    initToken || tokens?.[0] || null,
  );

  const hasError = !!(errorAmount || errorAddress);
  const maxAmount = !token?.amount ? 0 : token?.amount;
  const disabledMax = Number(valueAmount) >= roundToken(maxAmount);

  const onChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (Number(value) > roundToken(maxAmount)) return;

    setValueAmount(parseAmountInput(value));
  };

  const validate = () => {
    let hasError = false;
    if (!valueAmount || Number(valueAmount) <= 0) {
      hasError = true;
      setErrorAmount("Amount must be greater than 0");
    }

    if (Number(valueAmount) > roundToken(maxAmount)) {
      hasError = true;
      setErrorAmount("Insufficient balance");
    }

    if (!valueAddress) {
      hasError = true;
      setErrorAddress("Address is required");
    }

    try {
      assertIsAddress(valueAddress);
    } catch {
      hasError = true;
      setErrorAddress("Invalid address");
    }

    return hasError;
  };

  return (
    <div className="flex flex-col gap-4">
      <SelectTokenDropdown token={token} tokens={tokens} setToken={setToken} />
      <InputAddress
        value={valueAddress}
        error={errorAddress}
        clearError={() => setErrorAddress(undefined)}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setValueAddress(e.target.value)
        }
      />
      <InputAmount
        value={valueAmount}
        error={errorAmount}
        disabled={disabledMax}
        onChange={onChangeAmount}
        clearError={() => setErrorAmount(undefined)}
        onSetMax={() => setValueAmount(String(roundToken(maxAmount)))}
      />
      <PriceToken
        mint={token?.mint}
        maxAmount={maxAmount}
        amount={Number(valueAmount)}
      />
      <InitiateButton
        data={{
          token,
          toAddress: valueAddress,
          amount: Number(valueAmount),
        }}
        validate={validate}
        hasError={hasError}
        vaultAddress={vaultAddress}
        walletAccount={walletAccount}
        onCloseDialog={onCloseDialog}
        multisigAddress={multisigAddress}
        transactionIndex={transactionIndex}
      />
    </div>
  );
}

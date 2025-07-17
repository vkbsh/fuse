import { Address } from "gill";
import { ReactNode, useEffect, useState } from "react";

import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";

import { useWalletByName } from "~/hooks/wallet";
import { useMultisigAccount, useTokenInfo } from "~/hooks/resources";

import Field from "~/components/Field";

import SelectToken from "~/components/SelectToken";
import { Dialog, DialogContent } from "~/components/ui/dialog";

import Review from "./Review";
import EnterAmount from "./EnterAmount";

export default function WithdrawDialog({ children }: { children: ReactNode }) {
  const [isOpen, onOpenChange] = useState(false);
  const { walletStorage, multisigStorage } = useWalletStore();

  const multisigAddress = multisigStorage?.address as Address;
  const vaultAddress = multisigStorage?.defaultVault as Address;

  const { data: multisigAccount } = useMultisigAccount(multisigAddress);
  const transactionIndex = Number(multisigAccount?.transactionIndex);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children}
      <DialogContent title="Withdraw" isOpen={isOpen}>
        {transactionIndex && walletStorage && (
          <WithdrawForm
            onOpenChange={onOpenChange}
            vaultAddress={vaultAddress}
            walletName={walletStorage.name}
            multisigAddress={multisigAddress}
            transactionIndex={transactionIndex}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function WithdrawForm({
  walletName,
  vaultAddress,
  onOpenChange,
  multisigAddress,
  transactionIndex,
}: {
  walletName: string;
  vaultAddress: Address;
  multisigAddress: Address;
  transactionIndex: number;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    set,
    reset,
    token,
    amount,
    errors,
    addError,
    toAddress,
    removeError,
  } = useWithdrawStore();
  const wallet = useWalletByName(walletName);
  const { data: tokensInfo } = useTokenInfo(vaultAddress);
  const walletAccount = wallet?.accounts[0];

  useEffect(() => reset, []);

  return (
    <div className="flex flex-col gap-6 w-[390px]">
      <SelectToken
        token={token}
        tokens={tokensInfo}
        vaultAddress={vaultAddress}
        setToken={(token) => set("token", token)}
      />
      <Field
        label="To address"
        value={toAddress}
        error={errors?.toAddress}
        placeholder="Enter wallet address"
        onFocus={() => removeError("toAddress")}
        onChange={(e) => set("toAddress", e.target.value)}
      />
      <EnterAmount
        token={token}
        error={errors?.amount}
        amount={amount}
        removeError={() => removeError("amount")}
        setAmount={(amount) => set("amount", amount)}
      />
      {walletAccount && (
        <Review
          token={token}
          amount={amount}
          errors={errors}
          addError={addError}
          toAddress={toAddress}
          vaultAddress={vaultAddress}
          walletAccount={walletAccount}
          multisigAddress={multisigAddress}
          onClose={() => onOpenChange(false)}
          transactionIndex={transactionIndex}
        />
      )}
    </div>
  );
}

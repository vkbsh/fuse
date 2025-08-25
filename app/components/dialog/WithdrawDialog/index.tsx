import { Address } from "gill";

import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";

import { useWalletByName } from "~/hooks/wallet";
import { useMultisigAccount, useTokenInfo } from "~/hooks/resources";

import { Input } from "~/components/ui/input";
import SelectToken from "~/components/SelectToken";
import { DialogContent } from "~/components/ui/dialog";

import Review from "~/components/dialog/WithdrawDialog/Review";
import EnterAmount from "~/components/dialog/WithdrawDialog/EnterAmount";

export default function WithdrawDialogContent({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const walletStorage = useWalletStore((state) => state.walletStorage);
  const multisigStorage = useWalletStore((state) => state.multisigStorage);

  const multisigAddress = multisigStorage?.address as Address;
  const vaultAddress = multisigStorage?.defaultVault as Address;

  const { data: multisigAccount } = useMultisigAccount(multisigAddress);
  const transactionIndex = Number(multisigAccount?.transactionIndex);

  return (
    <DialogContent title="Withdraw" isOpen={isOpen} className="w-[485px]">
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
  const set = useWithdrawStore((state) => state.set);
  const token = useWithdrawStore((state) => state.token);
  const amount = useWithdrawStore((state) => state.amount);
  const errors = useWithdrawStore((state) => state.errors);
  const addError = useWithdrawStore((state) => state.addError);
  const toAddress = useWithdrawStore((state) => state.toAddress);
  const removeError = useWithdrawStore((state) => state.removeError);

  const wallet = useWalletByName(walletName);
  const { data: tokensInfo } = useTokenInfo(vaultAddress);
  const walletAccount = wallet?.accounts[0];

  return (
    <div className="flex flex-col gap-4">
      <SelectToken
        token={token}
        tokens={tokensInfo}
        vaultAddress={vaultAddress}
        setToken={(token) => set("token", token)}
      />
      <Input
        maxLength={44}
        value={toAddress}
        error={errors?.toAddress}
        placeholder="Enter wallet address"
        onFocus={() => removeError("toAddress")}
        onChange={(e) => set("toAddress", e.target.value)}
      />
      <EnterAmount
        token={token}
        amount={amount}
        error={errors?.amount}
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

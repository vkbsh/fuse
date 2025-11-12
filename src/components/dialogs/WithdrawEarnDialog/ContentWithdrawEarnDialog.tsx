import { type Address } from "gill";

import {
  type EarnCoin,
  useEarnBalance,
  useMultisigAccount,
} from "~/hooks/resources";
import { useWalletByName } from "~/hooks/wallet";

import WithdrawForm from "./WithdrawEarnForm";

export default function ContentWithdrawEarnDialog({
  initEarnCoin,
  walletName,
  vaultAddress,
  onCloseDialog,
  multisigAddress,
}: {
  initEarnCoin: EarnCoin;
  walletName: string;
  vaultAddress: Address;
  multisigAddress: Address;
  onCloseDialog: () => void;
}) {
  const wallet = useWalletByName(walletName);
  const { data: earnBalance } = useEarnBalance(vaultAddress);
  const { data: multisigAccount } = useMultisigAccount(multisigAddress);

  const walletAccount = wallet?.accounts[0];
  const transactionIndex = multisigAccount?.transactionIndex;

  return (
    <WithdrawForm
      earnCoins={earnBalance}
      initEarnCoin={initEarnCoin}
      vaultAddress={vaultAddress}
      onCloseDialog={onCloseDialog}
      walletAccount={walletAccount}
      multisigAddress={multisigAddress}
      transactionIndex={Number(transactionIndex)}
    />
  );
}

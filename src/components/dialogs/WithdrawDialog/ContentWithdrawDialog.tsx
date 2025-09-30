import { type Address } from "gill";

import { useTokenInfo, type TokenData } from "~/hooks/resources";
import { useMultisigAccount } from "~/hooks/resources";

import WithdrawForm from "./WithdrawForm";
import { useWalletByName } from "~/hooks/wallet";

export default function ContentWithdrawDialog({
  data,
  walletName,
  vaultAddress,
  onCloseDialog,
  multisigAddress,
}: {
  data: TokenData;
  walletName: string;
  vaultAddress: Address;
  multisigAddress: Address;
  onCloseDialog: () => void;
}) {
  const wallet = useWalletByName(walletName);
  const { data: tokensInfo } = useTokenInfo(vaultAddress);
  const { data: multisigAccount } = useMultisigAccount(multisigAddress);

  const walletAccount = wallet?.accounts[0];
  const transactionIndex = multisigAccount?.transactionIndex;

  return (
    <WithdrawForm
      initToken={data}
      tokens={tokensInfo}
      vaultAddress={vaultAddress}
      onCloseDialog={onCloseDialog}
      walletAccount={walletAccount}
      multisigAddress={multisigAddress}
      transactionIndex={Number(transactionIndex)}
    />
  );
}

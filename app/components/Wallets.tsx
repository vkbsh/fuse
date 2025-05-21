import { ErrorBoundary } from "react-error-boundary";
import { useWalletByKey } from "~/service/getWallets";
import { Address } from "~/model/web3js";
import { Wallet } from "~/model/wallet";

export function Wallets({ keyAddress }: { keyAddress: Address }) {
  return (
    <ErrorBoundary fallback={null}>
      <WalletsInner keyAddress={keyAddress} />
    </ErrorBoundary>
  );
}

function WalletsInner({ keyAddress }: { keyAddress: Address }) {
  const { data: multisig } = useWalletByKey(keyAddress);
  const { wallets } = multisig || {};

  return (
    <div>
      {wallets.map((wallet) => (
        <WalletRow key={wallet.address} wallet={wallet} />
      ))}
    </div>
  );
}

function WalletRow({ wallet }: { wallet: Wallet }) {
  return <div>{wallet.defaultVault}</div>;
}

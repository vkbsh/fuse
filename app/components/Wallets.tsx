import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useSuspenseWalletByKey } from "~/state/wallet";
import { Address } from "~/model/web3js";
import { Wallet } from "~/model/wallet";

export function Wallets({ keyAddress }: { keyAddress: Address }) {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={"Loading wallets..."}>
        <WalletsInner keyAddress={keyAddress} />
      </Suspense>
    </ErrorBoundary>
  );
}

function WalletsInner({ keyAddress }: { keyAddress: Address }) {
  const { wallets } = useSuspenseWalletByKey(keyAddress);

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

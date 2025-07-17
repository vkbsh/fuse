import { Address } from "gill";

import Main from "~/components/Main";
import Header from "~/components/Header";
import AutoReconnectWallet from "~/components/AutoReconnectWallet";

export default function Dashboard({
  walletName,
  vaultAddress,
  multisigAddress,
}: {
  walletName: string;
  vaultAddress: Address;
  multisigAddress: Address;
}) {
  return (
    <>
      <AutoReconnectWallet name={walletName} />
      <div
        id="dashboard"
        className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-10 justify-between select-none"
      >
        <Header vaultAddress={vaultAddress} />
        <Main vaultAddress={vaultAddress} multisigAddress={multisigAddress} />
      </div>
    </>
  );
}

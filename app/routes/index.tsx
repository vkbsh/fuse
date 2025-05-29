import { MetaFunction } from "react-router";

import Coins from "~/components/Coins";
import Connect from "~/components/Connect";
import Balance from "~/components/Balance";
import { Toasts } from "~/components/ui/Toast";
import Transactions from "~/components/Transactions";
import VaultAccount from "~/components/VaultAccount";
import WithdrawButton from "~/components/WithdrawButton";
import MemberKeysDropdown from "~/components/MemberKeysDropdown";
import AutoReconnectWallet from "~/components/AutoReconnectWallet";
import { ConnectWalletDialog } from "~/components/ConnectWalletDialog";
import WithdrawDialog from "~/components/withdraw-dialog/WithdrawDialog";

import { Address } from "~/model/web3js";
import { useWalletStore } from "~/state/wallet";

export const meta: MetaFunction = () => {
  return [
    { title: "Fuse Web Client - Access your Fuse Account" },
    { name: "description", content: "Access your Fuse Account on the web" },
  ];
};

export default function Index() {
  const { storageMultisigWallet, storageWallet } = useWalletStore();

  const vaultAddress = storageMultisigWallet?.defaultVault as Address;
  const multisigAddress = storageMultisigWallet?.address as Address;

  return (
    <>
      {!storageMultisigWallet || !storageWallet ? (
        <Connect />
      ) : (
        <>
          <AutoReconnectWallet name={storageWallet.name} />
          <div className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-10 justify-between">
            <header className="h-[42px] flex items-center justify-between">
              <VaultAccount vaultAddress={vaultAddress} />
              <MemberKeysDropdown />
            </header>
            <main className="flex-1 flex flex-col w-full h-full min-h-0 gap-10">
              <div className="flex flex-col">
                {/* TODO: Medium Refactoring */}
                <Balance vaultAddress={vaultAddress} />
                {/* TODO: Medium Refactoring */}
                <WithdrawButton />
              </div>
              <div className="flex flex-1 w-full h-full min-h-0 justify-between items-stretch">
                <div className="h-full flex flex-1 min-w-0 flex-col gap-4">
                  <h3 className="font-semibold text-xl">Coins</h3>
                  {/* TODO: Minimum Refactoring */}
                  <Coins vaultAddress={vaultAddress} />
                  {/* TODO: Minimum Refactoring */}
                </div>
                <div className="flex h-auto items-center mx-10">
                  <div className="w-px h-full bg-black/20" />
                </div>
                <div className="h-full flex flex-1 min-w-0 flex-col gap-4">
                  <h3 className="font-semibold text-xl">Transactions</h3>
                  <Transactions multisigAddress={multisigAddress} />
                </div>
              </div>
            </main>
          </div>
          <WithdrawDialog />
        </>
      )}
      <ConnectWalletDialog />
      <Toasts />
    </>
  );
}

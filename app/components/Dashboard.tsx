import { Address } from "gill";

import Coins from "~/components/Coins";
import Balance from "~/components/Balance";
import Transactions from "~/components/Transactions";
import VaultAccount from "~/components/VaultAccount";
import WithdrawButton from "~/components/WithdrawButton";
import WithdrawDialog from "~/components/WithdrawDialog";
import MemberKeysDropdown from "~/components/MemberKeysDropdown";
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
      <div className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-10 justify-between">
        <header className="h-[42px] flex items-center justify-between">
          <VaultAccount vaultAddress={vaultAddress} />
          <MemberKeysDropdown />
        </header>
        <main className="flex-1 flex flex-col w-full h-full min-h-0 gap-10">
          <div className="flex flex-col">
            <Balance vaultAddress={vaultAddress} />
            <WithdrawButton />
          </div>
          <div className="flex flex-1 w-full h-full min-h-0 justify-between items-stretch">
            <div className="h-full flex flex-1 min-w-0 flex-col gap-4">
              <h3 className="font-semibold text-xl">Coins</h3>
              <Coins vaultAddress={vaultAddress} />
            </div>
            <div className="flex h-auto items-center mx-10">
              <div className="w-px h-full bg-black-20" />
            </div>
            <div className="h-full basis-1/5 flex flex-1 min-w-0 flex-col gap-4">
              <h3 className="font-semibold text-xl">Transactions</h3>
              <Transactions multisigAddress={multisigAddress} />
            </div>
          </div>
        </main>
      </div>
      <WithdrawDialog />
    </>
  );
}

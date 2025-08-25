import VaultAccount from "~/components/VaultAccount";
import MemberKeysDropdown from "~/components/MemberKeysDropdown";

import { useWalletStore } from "~/state/wallet";
import { Address } from "gill";

export default function Header() {
  const multisigStorage = useWalletStore((state) => state.multisigStorage);
  const vaultAddress = multisigStorage?.defaultVault as Address;

  return (
    <header className="h-[42px] flex items-center justify-between">
      <VaultAccount vaultAddress={vaultAddress} />
      <div id="header-right" className="flex items-center gap-4">
        <MemberKeysDropdown />
      </div>
    </header>
  );
}

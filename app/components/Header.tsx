import { Address } from "gill";

import VaultAccount from "~/components/VaultAccount";
import UserDropdown from "~/components/UserDropdown";
import MemberKeysDropdown from "~/components/MemberKeysDropdown";

export default function Header({ vaultAddress }: { vaultAddress: Address }) {
  return (
    <header className="h-[42px] flex items-center justify-between">
      <VaultAccount vaultAddress={vaultAddress} />
      <div className="flex items-center gap-4">
        <MemberKeysDropdown />
        <UserDropdown />
      </div>
    </header>
  );
}

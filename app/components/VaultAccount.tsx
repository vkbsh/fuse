import { Address } from "gill";

import { abbreviateAddress } from "~/lib/address";
import { IconLogo } from "~/components/ui/icons/IconLogo";

export default function VaultAccount({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  return (
    <div className="flex items-center gap-4">
      <IconLogo />
      <span className="text-sm">{abbreviateAddress(vaultAddress)}</span>
    </div>
  );
}

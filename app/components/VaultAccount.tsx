import { Address } from "gill";

import { abbreviateAddress } from "~/lib/address";
import { IconLogo } from "~/components/ui/icons/IconLogo";

export default function VaultAccount({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  return (
    <div className="flex items-center gap-2.5 h-[64px]">
      <span className="rounded-full flex items-center justify-center">
        <IconLogo />
      </span>
      <div className="flex flex-row gap-3 items-center min-h-8 py-1 px-4 rounded-2xl">
        <span className="w-20 font-semibold text-sm">
          {abbreviateAddress(vaultAddress)}
        </span>
      </div>
    </div>
  );
}

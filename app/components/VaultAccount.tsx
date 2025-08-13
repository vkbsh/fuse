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
      <span className="flex items-center justify-center text-foreground rounded-full size-[42px] bg-accent-background">
        <IconLogo />
      </span>
      <span className=" flex items-center justify-center text-foreground h-[34px] rounded-2xl bg-accent-background px-3.5">
        {abbreviateAddress(vaultAddress)}
      </span>
    </div>
  );
}

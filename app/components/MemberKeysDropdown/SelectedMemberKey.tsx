import Animate from "~/components/animated/Animate";
import { IconChevronDown } from "~/components/ui/icons/IconChevronDown";

import { LSWallet } from "~/state/wallet";
import { abbreviateAddress } from "~/utils/address";

export default function SelectedMemberKey({
  wallet,
}: {
  wallet: LSWallet | null;
}) {
  if (!wallet) {
    return null;
  }

  return (
    <div className="cursor-pointer flex flex-row gap-3 items-center">
      <Animate
        key={wallet.address}
        variant="slideDown"
        className="flex flex-row gap-3 items-center"
      >
        <span className="flex w-[42px] h-[42px] rounded-full bg-foreground justify-center items-center text-black">
          <img
            src={wallet.icon}
            alt={wallet.name}
            className="rounded-full w-5 h-5"
          />
        </span>
        <span className="font-semibold w-[90px] text-sm text-primary-text">
          {abbreviateAddress(wallet.address)}
        </span>
      </Animate>
      <IconChevronDown />
    </div>
  );
}

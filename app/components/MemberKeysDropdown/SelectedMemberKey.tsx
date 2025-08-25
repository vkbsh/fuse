import { motion } from "motion/react";

import motionProps from "~/lib/motion";
import { LSWallet } from "~/state/wallet";
import { abbreviateAddress } from "~/lib/address";

function SelectedMemberKey({
  wallet,
}: {
  wallet: LSWallet | null | undefined;
}) {
  if (!wallet) {
    return null;
  }

  return (
    <motion.span
      key={wallet.address + wallet.name}
      className="flex items-center gap-2 text-foreground h-[34px] rounded-2xl bg-accent-background px-3.5"
      {...motionProps.memberKey.selectMember}
    >
      <img
        src={wallet.icon}
        alt={wallet.name}
        className="rounded-full w-5 h-5"
      />
      <span className="truncate w-20 text-sm">
        {abbreviateAddress(wallet.address)}
      </span>
    </motion.span>
  );
}

export default SelectedMemberKey;

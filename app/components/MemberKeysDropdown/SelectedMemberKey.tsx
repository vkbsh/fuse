import { motion } from "motion/react";

import { LSWallet } from "~/state/wallet";
import { abbreviateAddress } from "~/lib/address";

export default function SelectedMemberKey({
  wallet,
}: {
  wallet: LSWallet | null;
}) {
  if (!wallet) {
    return null;
  }

  return (
    <button className="cursor-pointer flex flex-row gap-3 items-center">
      <motion.div
        key={wallet.address}
        className="flex flex-row gap-3 items-center"
      >
        <span className="flex rounded-full justify-center items-center">
          <img
            src={wallet.icon}
            alt={wallet.name}
            className="rounded-full w-5 h-5"
          />
        </span>
        <span className="font-semibold w-[90px] text-sm text-primary-text">
          {abbreviateAddress(wallet.address)}
        </span>
      </motion.div>
    </button>
  );
}

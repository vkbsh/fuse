import { motion } from "motion/react";

import { IconLogo } from "~/components/ui/icons/IconLogo";
import { IconChevronDown } from "~/components/ui/icons/IconChevronDown";

import { LSWallet } from "~/state/wallet";
import { abbreviateAddress } from "~/utils/address";

export default function SelectedMemberKey({
  wallet,
}: {
  wallet: null | LSWallet;
}) {
  return (
    <div className="cursor-pointer flex flex-row gap-3 items-center">
      <motion.div
        key={wallet?.address}
        initial={{
          y: -5,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        exit={{
          y: -5,
          opacity: 0,
        }}
        transition={{ duration: 0.6 }}
        className="flex flex-row gap-3 items-center"
      >
        {wallet ? (
          <span className="flex w-[42px] h-[42px] rounded-full bg-[#EBEBEB] justify-center items-center text-black">
            <img
              src={wallet.icon}
              alt={wallet.name}
              className="rounded-full w-5 h-5"
            />
          </span>
        ) : (
          <span className="w-[42px] h-[42px] rounded-full bg-[#EBEBEB] flex items-center justify-center text-black">
            <IconLogo />
          </span>
        )}
        <span className="font-semibold w-[90px] text-sm text-primary-text">
          {wallet?.address
            ? abbreviateAddress(wallet.address)
            : "Select Account"}
        </span>
      </motion.div>
      <span>
        <IconChevronDown />
      </span>
    </div>
  );
}

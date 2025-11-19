import { motion, AnimatePresence } from "motion/react";

import Input from "~/components/ui/input";

import motionProps from "~/lib/motion";
import { getIconUrl } from "~/lib/utils";
import { abbreviateAddress } from "~/lib/address";

import { type EarnCoin } from "~/hooks/resources";

export default function SelectedToken({ earnCoin }: { earnCoin: EarnCoin }) {
  const iconUrl = earnCoin?.icon ? getIconUrl(earnCoin.icon) : null;

  return (
    <div className="relative flex flex-row gap-2 items-center w-full">
      <div className="absolute left-3 top-0 bottom-0 my-auto flex items-center">
        <AnimatePresence initial={false} mode="wait">
          {iconUrl ? (
            <motion.img
              key={iconUrl}
              src={iconUrl}
              alt={earnCoin?.name}
              className="w-7 h-7 rounded-full"
              {...motionProps.global.selectTokenDropdown}
            />
          ) : (
            <span className="w-7 h-7 shrink-0 rounded-full bg-placeholder" />
          )}
        </AnimatePresence>
      </div>
      <Input
        disabled
        tabIndex={-2}
        className="indent-12"
        value={
          earnCoin?.name || (earnCoin?.id ? abbreviateAddress(earnCoin.id) : "")
        }
      />
    </div>
  );
}

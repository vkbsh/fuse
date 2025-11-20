import { motion, AnimatePresence } from "motion/react";

import motionProps from "~/lib/motion";
import { getIconUrl, getEarnMeta } from "~/lib/utils";
import { type EarnCoin } from "~/hooks/resources";

import Input from "~/components/ui/input";

export default function SelectedToken({ earnCoin }: { earnCoin: EarnCoin }) {
  const meta = getEarnMeta(earnCoin?.programId || "");
  const iconUrl = earnCoin?.icon ? getIconUrl(earnCoin.icon) : null;

  return (
    <div className="relative">
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          src={meta.iconUrl}
          alt={meta.name}
          className="absolute top-0 bottom-0 m-auto left-4 w-7 h-7 rounded-full border border-border"
          {...motionProps.global.fadeIn}
        />
        {iconUrl ? (
          <motion.img
            key={iconUrl}
            src={iconUrl}
            alt={earnCoin?.name}
            className="absolute top-0 bottom-0 m-auto left-9 w-7 h-7 rounded-full border border-border"
            {...motionProps.global.fadeIn}
          />
        ) : (
          <span className="absolute top-0 bottom-0 m-auto left-9 w-7 h-7 shrink-0 rounded-full bg-placeholder" />
        )}
      </AnimatePresence>
      <Input disabled tabIndex={-2} className="indent-18" value={meta.name} />
    </div>
  );
}

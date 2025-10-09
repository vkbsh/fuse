import { motion, AnimatePresence } from "motion/react";

import Input from "~/components/ui/input";

import motionProps from "~/lib/motion";
import { getIconUrl } from "~/lib/utils";
import { abbreviateAddress } from "~/lib/address";

import { type TokenData } from "~/hooks/resources";

export default function SelectedToken({ token }: { token: TokenData }) {
  const iconUrl = getIconUrl(token?.icon);

  return (
    <div className="relative flex flex-row gap-2 items-center w-full">
      <div className="absolute left-3 top-0 bottom-0 my-auto flex items-center">
        <AnimatePresence initial={false} mode="wait">
          {iconUrl ? (
            <motion.img
              alt={token?.name}
              key={token?.icon}
              src={iconUrl}
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
          token?.name === "Wrapped SOL"
            ? "Solana"
            : token?.name || abbreviateAddress(token?.mint)
        }
      />
    </div>
  );
}

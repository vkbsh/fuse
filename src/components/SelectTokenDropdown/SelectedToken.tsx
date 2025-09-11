import { type Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import Input from "~/components/ui/input";

import motionProps from "~/lib/motion";
import { abbreviateAddress } from "~/lib/address";
import { type TokenData } from "~/hooks/resources";

export default function SelectedToken({
  token,
  fromAddress,
}: {
  token: TokenData;
  fromAddress: Address;
}) {
  return (
    <div className="relative flex flex-row gap-2 items-center w-full">
      <div className="absolute left-3 top-0 bottom-0 my-auto flex items-center">
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            alt={token?.name}
            key={token?.logoURI}
            src={token?.logoURI}
            className="w-7 h-7 rounded-full"
            {...motionProps.global.selectTokenDropdown}
          />
        </AnimatePresence>
      </div>
      <Input
        disabled
        tabIndex={-2}
        className="indent-12"
        value={abbreviateAddress(fromAddress)}
      />
    </div>
  );
}

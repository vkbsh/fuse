import { Address } from "gill";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";

import motionProps from "~/lib/motion";
import { TokenData } from "~/hooks/resources";
import { abbreviateAddress } from "~/lib/address";
import { getRoundedSOL, getRoundedToken } from "~/lib/amount";

export default function SelectToken({
  token,
  tokens,
  setToken,
  vaultAddress,
}: {
  tokens: TokenData[];
  vaultAddress: Address;
  token?: TokenData | null;
  setToken: (token: TokenData) => void;
}) {
  const [isOpen, onOpenChange] = useState(false);
  const selected = token || tokens?.[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>
        <SelectedToken token={selected} fromAddress={vaultAddress} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        isOpen={isOpen}
        className="flex flex-col p-3 gap-4 max-h-[190px] scroll-smooth overflow-y-auto scrollbar-hidden"
      >
        <AnimatePresence initial={false}>
          {tokens.map((item) => {
            if (!item) return null;

            const amount =
              item?.symbol?.toLocaleLowerCase() === "sol"
                ? getRoundedSOL(item.amount)
                : getRoundedToken(item.amount);
            const name = item.name === "Wrapped SOL" ? "Solana" : item.name;

            return (
              <DropdownMenuItem key={item.address}>
                <motion.div
                  key={item.address}
                  onClick={() => setToken(item)}
                  className="flex items-center rounded-md cursor-default"
                  {...motionProps.fadeInView}
                >
                  <div className="flex flex-row gap-2 items-center justify-between w-full">
                    <div className="flex flex-row items-center gap-2.5">
                      <img
                        alt={item.name}
                        src={item.logoURI}
                        className="w-7 h-7 rounded-full"
                      />
                      <span className="max-w-18 truncate">{name}</span>
                    </div>
                    <div className="flex flex-row gap-1">
                      <div className="uppercase font-medium max-w-22 truncate">
                        {amount}
                      </div>
                      <span>{item.symbol}</span>
                    </div>
                  </div>
                </motion.div>
              </DropdownMenuItem>
            );
          })}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SelectedToken({
  token,
  fromAddress,
  ...rest
}: {
  token: TokenData;
  fromAddress: Address;
}) {
  return (
    <div className="relative flex flex-row gap-2 items-center w-full" {...rest}>
      <div className="absolute left-3 top-0 bottom-0 my-auto flex items-center">
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={token?.logoURI}
            alt={token?.name}
            src={token?.logoURI}
            className="w-7 h-7 rounded-full"
            {...motionProps.selectToken}
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

import { Address } from "gill";
import { forwardRef, Ref, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";

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

  useEffect(() => {
    if (!selected) return;

    setToken(selected);
  }, [selected]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
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
              <DropdownMenuItem>
                <motion.div
                  key={item.mint}
                  transition={{ duration: 0.4 }}
                  exit={{ x: -8, filter: "blur(3px)" }}
                  initial={{
                    x: -8,
                    filter: "blur(3px)",
                    backgroundColor: "var(--color-background)",
                  }}
                  whileInView={{
                    x: 0,
                    filter: "blur(0px)",
                  }}
                  onClick={() => setToken(item)}
                  className="flex items-center rounded-md cursor-default"
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

const SelectedToken = forwardRef(
  (
    props: {
      token: TokenData;
      fromAddress: Address;
    },
    ref: Ref<HTMLInputElement>,
  ) => {
    const { token, fromAddress, ...rest } = props;

    return (
      <div
        ref={ref}
        {...rest}
        className="relative flex flex-row gap-2 items-center w-full"
      >
        <div className="absolute left-3 top-0 bottom-0 my-auto flex items-center">
          <AnimatePresence initial={false} mode="wait">
            <motion.img
              key={token?.logoURI}
              initial={{
                rotateY: -90,
                filter: "blur(4px)",
              }}
              animate={{
                rotateY: 0,
                filter: "blur(0px)",
              }}
              exit={{
                rotateY: -90,
                filter: "blur(4px)",
              }}
              transition={{ duration: 0.15 }}
              alt={token?.name}
              src={token?.logoURI}
              className="w-7 h-7 rounded-full"
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
  },
);

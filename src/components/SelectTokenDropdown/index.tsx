import { useState } from "react";
import { type Address } from "gill";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import SelectedToken from "./SelectedToken";

import { type TokenData } from "~/hooks/resources";
import { roundToken } from "~/lib/amount";

export default function SelectTokenDropdown({
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
      {tokens.length > 1 && (
        <DropdownMenuContent
          align="start"
          isOpen={isOpen}
          className="flex flex-col p-3 gap-0.5 w-[302px] max-h-[279px] scroll-smooth overflow-y-auto scrollbar-hidden border border-white/30"
        >
          {tokens.map((item) => {
            if (!item) return null;

            const amount = roundToken(item.amount);
            const name = item.name === "Wrapped SOL" ? "Solana" : item.name;

            return (
              <DropdownMenuItem key={item.address}>
                <div
                  key={item.address}
                  onClick={() => setToken(item)}
                  className="relative flex flex-row gap-2 items-center p-2 rounded-2xl border border-white/0 hover:bg-white/15 hover:text-white/30 hover:border-white/15 duration-300 transition-colors"
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
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

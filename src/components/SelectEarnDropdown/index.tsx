import { useState } from "react";

import { roundToken } from "~/lib/amount";
import { getIconUrl } from "~/lib/utils";
import { abbreviateAddress } from "~/lib/address";
import { type EarnCoin } from "~/hooks/resources";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import SelectedToken from "./SelectedEarnCoin";

export default function SelectTokenDropdown({
  selectedEarnCoin,
  earnCoins,
  setEarnCoin,
}: {
  earnCoins: EarnCoin[];
  selectedEarnCoin: EarnCoin | null | undefined;
  setEarnCoin: (earnCoin: EarnCoin) => void;
}) {
  const [isOpen, onOpenChange] = useState(false);
  const selected = selectedEarnCoin || earnCoins?.[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>
        <SelectedToken earnCoin={selected} />
      </DropdownMenuTrigger>
      {earnCoins?.length ? (
        <DropdownMenuContent
          align="start"
          isOpen={isOpen}
          className="flex flex-col p-3 gap-0.5 w-[302px] max-h-[279px] scroll-smooth overflow-y-auto scrollbar-hidden border border-white/30"
        >
          {earnCoins.map((item) => {
            if (!item) return null;

            const amount = roundToken(item.usdAmount);
            const name = item.name === "Wrapped SOL" ? "Solana" : item.name;
            const iconUrl = getIconUrl(item.icon);

            return (
              <DropdownMenuItem key={item.id + amount}>
                <div
                  key={item.id}
                  onClick={() => setEarnCoin(item)}
                  className="relative flex flex-row gap-2 items-center p-2 rounded-2xl border border-white/0 hover:bg-white/15 hover:text-white/30 hover:border-white/15 duration-300 transition-colors"
                >
                  <div className="flex flex-row gap-2 items-center justify-between w-full">
                    <div className="flex flex-row items-center gap-2.5">
                      {iconUrl ? (
                        <img
                          alt={item.name}
                          src={iconUrl}
                          className="w-7 h-7 rounded-full"
                        />
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-placeholder" />
                      )}
                      <span className="max-w-18 truncate">
                        {name || abbreviateAddress(item.mint)}
                      </span>
                    </div>
                    <div className="flex flex-row gap-1">
                      <div className="uppercase font-medium max-w-16 truncate">
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
      ) : null}
    </DropdownMenu>
  );
}

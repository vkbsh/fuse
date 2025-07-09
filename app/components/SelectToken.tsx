import { Address } from "gill";
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { useWithdrawStore } from "~/state/withdraw";
import { useTokenInfo, TokenData } from "~/hooks/resources";
import { getRoundedSOL, getRoundedToken } from "~/lib/amount";

export default function SelectToken({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  const { set, token } = useWithdrawStore();
  const { data: tokensInfo } = useTokenInfo(vaultAddress);

  const items = tokensInfo;
  const selected = token || tokensInfo?.[0];

  useEffect(() => {
    if (selected?.address !== token?.ata) {
      set("token", selected);
    }
  }, [selected]);

  const itemsComponent = items.map((item) => {
    if (!item) return null;

    const amount =
      item?.symbol?.toLocaleLowerCase() === "sol"
        ? getRoundedSOL(item.amount)
        : getRoundedToken(item.amount);
    const name = item.name === "Wrapped SOL" ? "Solana" : item.name;

    return (
      <DropdownMenuItem key={item.mint}>
        <div
          onClick={() => set("token", item)}
          className="flex items-center cursor-pointer w-[300px] h-[46px] p-4 rounded-[14px]"
        >
          <div className="flex flex-row items-center justify-between  w-full">
            <div className="flex flex-row items-center gap-2">
              <img
                src={item.logoURI}
                alt={item.name}
                className="w-7 h-7 rounded-full"
              />
              <span className="font-semibold text-base max-w-28 truncate">
                {name}
              </span>
            </div>
            <div className="flex flex-row gap-1">
              <div className="uppercase font-medium text-sm max-w-32 truncate">
                {amount}
              </div>
              <span>{item.symbol}</span>
            </div>
          </div>
        </div>
      </DropdownMenuItem>
    );
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <SelectedToken token={selected} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        className="max-h-[242px]"
      >
        {itemsComponent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const SelectedToken = ({ token }: { token: TokenData | null }) => {
  if (!token) return null;

  return (
    <div className="relative cursor-pointer px-2 pr-3.5 min-w-[130px] h-[40px] bg-white-20 flex flex-row gap-2 items-center rounded-full text-white border border-white-5">
      <img
        alt={token?.name}
        src={token?.logoURI}
        className="w-7 h-7 rounded-full"
      />
      <span className="uppercase font-semibold text-base ">
        {token?.symbol}
      </span>
      <span className="text-white-30 ml-auto">
        <ChevronDown />
      </span>
    </div>
  );
};

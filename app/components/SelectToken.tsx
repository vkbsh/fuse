import { motion } from "motion/react";

import Dropdown from "~/components/ui/Dropdown";
import { IconChevronDown } from "~/components/ui/icons/IconChevronDown";
import { useTokenInfo } from "~/hooks/resources";

import { useWithdrawStore } from "~/state/withdraw";
import { Address } from "~/model/web3js";

import { getRoundedSOL, getRoundedToken } from "~/utils/amount";
import { useEffect } from "react";

export type Token = {
  name: string;
  symbol: string;
  amount: number;
  decimals: number;
  ata: Address;
  mint: Address;
  logoURI: string;
};
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
    if (selected.address !== token?.ata) {
      set("token", selected);
    }
  }, [selected]);

  const itemsComponent = items.map((item, i) => {
    const amount =
      item?.symbol?.toLocaleLowerCase() === "sol"
        ? getRoundedSOL(item.amount)
        : getRoundedToken(item.amount);
    const name = item.name === "Wrapped SOL" ? "Solana" : item.name;

    return (
      <motion.div
        key={i}
        whileHover={{
          color: "var(--color-select-text-hover)",
          backgroundColor: "var(--color-select-bg-hover)",
          borderColor: "var(--color-select-border-hover)",
        }}
        onClick={() => set("token", item)}
        className="flex items-center cursor-pointer w-[279px] h-[46px] p-4 rounded-[14px] text-white border border-transparent"
      >
        <div className="flex flex-row items-center justify-between  w-full">
          <div className="flex flex-row items-center gap-2">
            <img
              src={item.logoURI}
              alt={item.name}
              className="w-7 h-7 rounded-full  

              "
            />
            <span className="font-semibold text-base max-w-26 truncate">
              {name}
            </span>
          </div>
          <span className="uppercase font-medium text-sm truncate">
            {amount} {item.symbol}
          </span>
        </div>
      </motion.div>
    );
  });

  return (
    <Dropdown
      align="start"
      items={itemsComponent}
      className="overflow-scroll max-h-[226px] ring-white/30 relative z-30"
      trigger={<SelectedToken token={selected} />}
    />
  );
}

const SelectedToken = ({ token }: { token: Token | null }) => {
  return (
    <div className="relative cursor-pointer px-2 pr-3.5 min-w-[130px] h-[40px] bg-white/20 flex flex-row gap-2 items-center rounded-full text-white border border-white/5">
      <img
        src={token?.logoURI}
        alt={token?.name}
        className="w-7 h-7 rounded-full"
      />

      <span className="uppercase font-semibold text-base ">
        {token?.symbol}
      </span>
      <span className="text-white/30 ml-auto">
        <IconChevronDown />
      </span>
    </div>
  );
};

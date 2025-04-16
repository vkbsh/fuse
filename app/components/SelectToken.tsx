import { motion } from "motion/react";

import Dropdown from "~/components/ui/Dropdown";
import { IconChevronDown } from "~/components/icons/IconChevronDown";

import { getRoundedSOL, getRoundedCoin } from "~/utils/amount";

export type Token = {
  name: string;
  symbol: string;
  amount: number;
  logoURI: string;
};

type Props = {
  items: Token[];
  selected: Token | null;
  onSelect: (token: Token) => void;
};
export default function SelectToken({ items, selected, onSelect }: Props) {
  const itemsComponent = items.map((item, i) => {
    const amount =
      item.symbol.toLocaleLowerCase() === "sol"
        ? getRoundedSOL(item.amount)
        : getRoundedCoin(item.amount);
    const name = item.name === "Wrapped SOL" ? "Solana" : item.name;

    return (
      <motion.div
        key={i}
        whileHover={{
          color: "var(--color-hover-text)",
          backgroundColor: "var(--color-hover-background)",
        }}
        onClick={() => onSelect(item)}
        className="flex items-center cursor-pointer w-[279px] h-[46px] p-4 rounded-[14px]"
      >
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row items-center gap-2">
            <span className="w-4 h-4 bg-amber-600 rounded-full" />
            <span className="font-semibold text-base">{name}</span>
          </div>
          <span className="uppercase font-medium text-sm text-grey-text">
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
      trigger={<SelectedToken tokenCode={selected?.symbol} />}
    />
  );
}

const SelectedToken = ({ tokenCode }: { tokenCode: string }) => {
  return (
    <div className="relative cursor-pointer w-[116px] p-[5px] h-[40px] bg-trn-hover flex flex-row gap-1.5 items-center rounded-full">
      <span className="w-[30px] h-[30px] flex items-center justify-center bg-black rounded-full">
        <span className="w-3 h-3 bg-amber-600 rounded-full" />
      </span>
      <span className="uppercase font-medium text-base text-white">
        {tokenCode}
      </span>
      <span className="text-amber-600 absolute right-3.5">
        <IconChevronDown />
      </span>
    </div>
  );
};

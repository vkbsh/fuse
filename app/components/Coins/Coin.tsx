import AnimateString from "~/components/animated/AnimateString";

import { roundCoin } from "~/utils/amount";

export default function Coin({
  token,
  onClick,
}: {
  token: any;
  onClick: () => void;
}) {
  const { name, symbol, logoURI, amount, usdAmount } = token;
  const roundedAmount = roundCoin("token", Number(amount)) + "";
  const roundedUsdAmount = roundCoin("usd", Number(usdAmount)) + "";

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between cursor-pointer rounded-[20px] p-3 hover:bg-trn-hover duration-500"
    >
      <div className="flex flex-row items-center gap-6">
        <span className="w-[42px] h-[42px] shrink-0 bg-black rounded-full flex items-center justify-center overflow-hidden">
          <img src={logoURI} alt={name} />
        </span>
        <span className="flex flex-col gap-0">
          <span className="font-semibold">
            {name === "Wrapped SOL" ? "Solana" : name}
          </span>
          <span className="opacity-40 font-medium flex flex-row gap-1">
            <span className="flex flex-row">
              <AnimateString string={roundedAmount} />
            </span>
            <span>{symbol}</span>
          </span>
        </span>
      </div>
      <div className="font-medium flex mt-auto">
        <span>$</span>
        <AnimateString string={roundedUsdAmount} />
      </div>
    </div>
  );
}

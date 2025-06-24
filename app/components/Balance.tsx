import { Address } from "gill";

import { roundCoin } from "~/utils/amount";
import { useTokenInfo } from "~/hooks/resources";
import AnimateList from "~/components/animated/AnimateList";

export default function BalanceComponent({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  return (
    <section className="w-auto flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      {vaultAddress && <TotalBalance vaultAddress={vaultAddress} />}
    </section>
  );
}

function TotalBalance({ vaultAddress }: { vaultAddress: Address }) {
  const { totalAmount, isLoading, isError } = useTokenInfo(vaultAddress);

  const roundedAmount = roundCoin("usd", totalAmount);
  const roundedAmounArray = String(roundedAmount).split("");

  return (
    <div className="flex flex-row text-[45px] font-bold">
      <span>$</span>
      {totalAmount && (
        <AnimateList
          variant="slideDown"
          list={roundedAmounArray.map((num) => num)}
        />
      )}
    </div>
  );
}

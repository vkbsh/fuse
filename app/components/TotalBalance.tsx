import { Address } from "gill";
import { AnimatePresence } from "motion/react";

import Animate from "~/components/animated/Animate";
import AnimateString from "~/components/animated/AnimateString";

import { roundCoin } from "~/utils/amount";
import { useTokenInfo } from "~/hooks/resources";

export default function TotalBalance({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  return (
    <section className="w-auto flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      <Balance vaultAddress={vaultAddress} />
    </section>
  );
}

function Balance({ vaultAddress }: { vaultAddress: Address }) {
  const { totalAmount } = useTokenInfo(vaultAddress);
  const roundedAmount = roundCoin("usd", totalAmount) + "";

  return (
    <div className="flex flex-row text-[45px] font-bold">
      <span>$</span>
      <AnimatePresence>
        {totalAmount ? (
          <Animate variant="fadeIn">
            <AnimateString string={roundedAmount} />
          </Animate>
        ) : (
          <Animate variant="fadeIn" className="opacity-40 blur-xs">
            --.--
          </Animate>
        )}
      </AnimatePresence>
    </div>
  );
}

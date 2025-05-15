import { motion } from "motion/react";

import { Address } from "~/model/web3js";
import { getRoundedUSD } from "~/utils/amount";
import { useVaultTokens } from "~/state/totalBalance";
import { BalanceData, useBalanceQuery } from "~/state/balance";

export default function Balance({ vaultAddress }: { vaultAddress: Address }) {
  return (
    <section className="flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      {vaultAddress && <TotalBalance vaultAddress={vaultAddress} />}
    </section>
  );
}

function TotalBalance({ vaultAddress }: { vaultAddress: Address }) {
  const { data, isLoading } = useBalanceQuery({ address: vaultAddress });

  if (!data || isLoading) {
    return <motion.span className="text-[45px] font-bold">$0.00</motion.span>;
  }

  return <TotalAmount vaultAddress={vaultAddress} balanceData={data} />;
}

function TotalAmount({
  vaultAddress,
  balanceData,
}: {
  vaultAddress: Address;
  balanceData: BalanceData;
}) {
  const { totalAmount } = useVaultTokens({
    balanceData,
    vaultAddress,
  });

  return (
    <motion.span key={totalAmount} className="text-[45px] font-bold">
      ${typeof totalAmount === "number" ? getRoundedUSD(totalAmount) : "-"}
    </motion.span>
  );
}

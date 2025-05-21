import { motion, AnimatePresence } from "motion/react";

import { useBalance, useTokensPrice } from "~/hooks/resources";
import { getRoundedUSD } from "~/utils/amount";

import { Address } from "~/model/web3js";
import { Balance } from "~/model/balance";

export default function BalanceComponent({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  return (
    <section className="flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      <AnimatePresence>
        {vaultAddress && <TotalBalance vaultAddress={vaultAddress} />}
      </AnimatePresence>
    </section>
  );
}

function TotalBalance({ vaultAddress }: { vaultAddress: Address }) {
  const { data, isLoading } = useBalance(vaultAddress);

  if (!data?.spl || isLoading) {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-[45px] font-bold"
      >
        $0.00
      </motion.span>
    );
  }

  return <TotalAmount vaultAddress={vaultAddress} balanceData={data} />;
}

function TotalAmount({
  vaultAddress,
  balanceData,
}: {
  vaultAddress: Address;
  balanceData: Balance;
}) {
  const tokens = Object.keys(balanceData.spl);
  const res = useTokensPrice(tokens);
  const isLoading = res.some((r) => r.isLoading);

  const totalAmount = res.reduce((acc, { data }) => {
    if (!data) return acc;

    return (
      acc +
      (data.price * Number(balanceData.spl[data.mint]?.amount)) /
        10 ** balanceData.spl[data.mint]?.decimals
    );
  }, 0);

  if (isLoading) {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-[45px] font-bold"
      >
        $0.00
      </motion.span>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      key={totalAmount}
      className="text-[45px] font-bold"
    >
      ${typeof totalAmount === "number" ? getRoundedUSD(totalAmount) : "-"}
    </motion.span>
  );
}

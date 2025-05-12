import { motion } from "motion/react";

import { useWalletStore } from "~/state/wallet";
import { useVaultTokens } from "~/state/totalBalance";

import { Address } from "~/model/web3js";
import { getRoundedUSD } from "~/utils/amount";
import { BalanceData, useBalanceQuery } from "~/state/balance";

export default function Balance() {
  const { currentMultisigWallet } = useWalletStore();

  return (
    <section className="flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      {currentMultisigWallet?.defaultVault && (
        <TotalBalance address={currentMultisigWallet.defaultVault} />
      )}
    </section>
  );
}

function TotalBalance({ address }: { address: Address }) {
  const balanceData = useBalanceQuery({ address });

  if (!balanceData) {
    return 0;
  }

  return <TotalAmount address={address} balanceData={balanceData} />;
}

function TotalAmount({
  address,
  balanceData,
}: {
  address: Address;
  balanceData: BalanceData;
}) {
  const { totalAmount } = useVaultTokens({ address, balanceData });

  return (
    <motion.span
      key={totalAmount}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-[45px] font-bold"
    >
      ${typeof totalAmount === "number" ? getRoundedUSD(totalAmount) : "-"}
    </motion.span>
  );
}

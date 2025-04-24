import { memo } from "react";

import { useWalletStore } from "~/state/wallet";
import { useWalletTokens } from "~/state/totalBalance";

import { Address } from "~/model/web3js";
import { getRoundedUSD } from "~/utils/amount";

export default function Balance() {
  const { currentMultisigWallet } = useWalletStore();
  const vaultAddress = currentMultisigWallet?.defaultVault;

  return (
    <section className="flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      {vaultAddress && <MemoizedTotalAmount address={vaultAddress} />}
    </section>
  );
}

function TotalAmount({ address }: { address: Address }) {
  const { totalAmount } = useWalletTokens({ address });

  return (
    <span className="text-[45px] font-bold">
      ${typeof totalAmount === "number" ? getRoundedUSD(totalAmount) : "-"}
    </span>
  );
}

const MemoizedTotalAmount = memo(TotalAmount);

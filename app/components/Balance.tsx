import { address } from "gill";

import { useWalletStore } from "~/state/wallet";
import { useWalletTokens } from "~/state/totalBalance";

import { getRoundedUSD } from "~/utils/amount";
import { Address } from "~/model/web3js";

export default function Balance() {
  const { currentMultisigWallet } = useWalletStore();
  const { totalAmount } = useWalletTokens({
    address: address(currentMultisigWallet?.defaultVault as Address),
  });

  return (
    <section className="flex flex-col">
      <span className="font-medium text-sm opacity-40">Total Balance</span>
      <span className="text-[45px] font-bold">
        ${typeof totalAmount === "number" ? getRoundedUSD(totalAmount) : "-"}
      </span>
    </section>
  );
}
